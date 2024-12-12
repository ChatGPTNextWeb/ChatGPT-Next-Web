// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod stream;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![stream::stream_fetch])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// pub fn run() {
//     tauri::Builder::default()
//         .plugin(tauri_plugin_http::init())
//         .plugin(tauri_plugin_shell::init())
//         .plugin(tauri_plugin_notification::init())
//         .plugin(tauri_plugin_dialog::init())
//         not compatible with mobile
//         .plugin(tauri_plugin_updater::Builder::new().build())
//         .plugin(tauri_plugin_fs::init())
//         .plugin(tauri_plugin_clipboard_manager::init())
//         .invoke_handler(tauri::generate_handler![stream::stream_fetch])
//         not compatible with mobile
//         .plugin(tauri_plugin_window_state::Builder::default().build())
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }
