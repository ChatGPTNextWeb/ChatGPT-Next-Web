use tauri::{Manager,AppHandle, GlobalShortcutManager};

#[tauri::command]
pub fn update_shortcut(shortcut: String, handle: AppHandle) {
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
        }) {
        Ok(_) => println!("Shortcut registered successfully"),
        Err(err) => eprintln!("Failed to register shortcut: {}", err),
    }
}