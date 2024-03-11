// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{GlobalShortcutManager, Manager,CustomMenuItem,  SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

#[tauri::command]
fn update_shortcut(shortcut: String, handle: tauri::AppHandle) {
    handle
        .global_shortcut_manager()
        .unregister_all()
        .unwrap();
    
    let window = handle.get_window("main").unwrap();
    match handle
        .global_shortcut_manager()
        .register(&shortcut, move || {
            println!("Shortcut triggered successfully");
            window.unminimize().unwrap();
            window.set_focus().unwrap();
            window.emit("activate_input_field", {}).unwrap();
        })
        {
        Ok(_) => println!("Shortcut registered successfully"),
        Err(err) => eprintln!("Failed to register shortcut: {}", err),
    }
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit);

    let system_tray = SystemTray::new()
        .with_menu(tray_menu);

    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![update_shortcut])
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
