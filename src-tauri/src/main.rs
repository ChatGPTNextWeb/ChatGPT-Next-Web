// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{GlobalShortcutManager, Manager};

#[tauri::command]
fn update_shortcut(shortcut: String, handle: tauri::AppHandle) {
    handle
        .global_shortcut_manager()
        .unregister_all()
        .unwrap();
    
    let window = handle.get_window("main").unwrap();
    handle
        .global_shortcut_manager()
        .register(&shortcut, move || {
            window.show().unwrap();
            window.set_focus().unwrap();
            window.emit("activate_input_field", {}).unwrap();
        })
        .unwrap();
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .invoke_handler(tauri::generate_handler![update_shortcut])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
