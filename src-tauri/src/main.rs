// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod stream;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .register_uri_scheme_protocol("stream", move |app_handle, request| {
      stream::stream(app_handle, request)
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
