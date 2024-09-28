
use std::error::Error;
use futures_util::{StreamExt};
use reqwest::Client;
use tauri::{ Manager, AppHandle };
use tauri::http::{Request, ResponseBuilder};
use tauri::http::Response;

static mut REQUEST_COUNTER: u32 = 0;

#[derive(Clone, serde::Serialize)]
pub struct ErrorPayload {
  request_id: u32,
  error: String,
}

#[derive(Clone, serde::Serialize)]
pub struct StatusPayload {
  request_id: u32,
  status: u16,
}

#[derive(Clone, serde::Serialize)]
pub struct HeaderPayload {
  request_id: u32,
  name: String,
  value: String,
}

#[derive(Clone, serde::Serialize)]
pub struct ChunkPayload {
  request_id: u32,
  chunk: bytes::Bytes,
}

pub fn stream(app_handle: &AppHandle, request: &Request) -> Result<Response, Box<dyn Error>> {
  let mut request_id = 0;
  let event_name = "stream-response";
  unsafe {
    REQUEST_COUNTER += 1;
    request_id = REQUEST_COUNTER;
  }
  let path = request.uri().to_string().replace("stream://localhost/", "").replace("http://stream.localhost/", "");
  let path = percent_encoding::percent_decode(path.as_bytes())
    .decode_utf8_lossy()
    .to_string();
  // println!("path : {}", path);
  let client = Client::new();
  let handle = app_handle.app_handle();
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
        handle.emit_all(event_name, StatusPayload{ request_id, status: res.status().as_u16() }).unwrap();
        for (name, value) in res.headers() {
          handle.emit_all(event_name, HeaderPayload {
            request_id,
            name: name.to_string(),
            value: std::str::from_utf8(value.as_bytes()).unwrap().to_string()
          }).unwrap();
        }
        let mut stream = res.bytes_stream();

        while let Some(chunk) = stream.next().await {
          match chunk {
            Ok(bytes) => {
              handle.emit_all(event_name, ChunkPayload{ request_id, chunk: bytes }).unwrap();
            }
            Err(err) => {
              println!("Error: {:?}", err);
            }
          }
        }
        handle.emit_all(event_name, StatusPayload { request_id, status: 0 }).unwrap();
      }
      Err(err) => {
        println!("Error: {:?}", err.source().expect("REASON").to_string());
        handle.emit_all(event_name, ErrorPayload {
          request_id,
          error: err.source().expect("REASON").to_string()
        }).unwrap();
      }
    }
  });
  return ResponseBuilder::new()
    .header("Access-Control-Allow-Origin", "*")
    .status(200).body(request_id.to_string().into())
}
