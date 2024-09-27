// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures_util::{StreamExt};
use reqwest::Client;
use tauri::{ Manager};
use tauri::http::{ResponseBuilder};

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .register_uri_scheme_protocol("sse", |app_handle, request| {
      let path = request.uri().strip_prefix("sse://localhost/").unwrap();
      let path = percent_encoding::percent_decode(path.as_bytes())
        .decode_utf8_lossy()
        .to_string();
      // println!("path : {}", path);
      let client = Client::new();
      let window = app_handle.get_window("main").unwrap();
      // send http request
      let body = reqwest::Body::from(request.body().clone());
      let response_future = client.request(request.method().clone(), path)
        .headers(request.headers().clone())
        .body(body).send();

      // get response and emit to client
      tauri::async_runtime::spawn(async move {
        let res = response_future.await;

        match res {
          Ok(res) => {
            let mut stream = res.bytes_stream();

            while let Some(chunk) = stream.next().await {
              match chunk {
                Ok(bytes) => {
                  window.emit("sse-response", bytes).unwrap();
                }
                Err(err) => {
                  println!("Error: {:?}", err);
                }
              }
            }
            window.emit("sse-response", 0).unwrap();
          }
          Err(err) => {
            println!("Error: {:?}", err);
          }
        }
      });
      ResponseBuilder::new()
        .header("Access-Control-Allow-Origin", "*")
        .status(200).body("OK".into())
      })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
