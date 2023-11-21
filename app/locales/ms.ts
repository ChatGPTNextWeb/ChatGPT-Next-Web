import { SubmitKey } from "../store/config";
import { PartialLocaleType } from "./index";

const ms: PartialLocaleType = {
  WIP: "Akan Datang...",
  Error: {
    Unauthorized:
      "Akses tidak dibenarkan, sila masukkan kod akses atau masukkan kunci API OpenAI Anda. di halaman [pengesahan](/#/auth) atau di halaman [Tetapan](/#/settings).",
  },
  Auth: {
    Title: "Kod Akses Diperlukan",
    Tips: "Masukkan kod akses di bawah",
    SubTips: "Atau masukkan kunci API OpenAI Anda",
    Input: "Kod Akses",
    Confirm: "Sahkan",
    Later: "Kemudian",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} mesej`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} mesej`,
    Actions: {
      ChatList: "Buka Senarai Sembang",
      CompressedHistory: "Eksport Sejarah Terkompresi",
      Export: "Eksport Semua Mesej sebagai Markdown",
      Copy: "Salin",
      Stop: "Berhenti",
      Retry: "Cuba Lagi",
      Pin: "Pin",
      PinToastContent: "2 mesej telah ditanda",
      PinToastAction: "Lihat",
      Delete: "Padam",
      Edit: "Sunting",
    },
    Commands: {
      new: "Mulakan Sembang Baru",
      newm: "Mulakan Sembang Baru dengan Masks",
      next: "Sembang Seterusnya",
      prev: "Sembang Sebelumnya",
      clear: "Bersihkan Perbualan",
      del: "Padam Sembang",
    },
    InputActions: {
      Stop: "Berhenti",
      ToBottom: "Ke Bahagian Bawah",
      Theme: {
        auto: "Automatik",
        light: "Tema Cerah",
        dark: "Tema Gelap",
      },
      Prompt: "Petunjuk",
      Masks: "Masks",
      Clear: "Bersihkan Perbualan",
      Settings: "Tetapan",
    },
    Rename: "Tukar Nama Sembang",
    Typing: "Mengetik...",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} untuk menghantar`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter untuk baris baru";
      }
      return (
        inputHints + ", / untuk cari petunjuk, : untuk gunakan arahan"
      );
    },
    Send: "Hantar",
    Config: {
      Reset: "Set Semula ke Asal",
      SaveAs: "Simpan sebagai Masks",
    },
  },
    Export: {
        Title: "Eksport Mesej",
        Copy: "Salin Semua",
        Download: "Muat Turun",
        MessageFromYou: "Mesej dari Anda",
        MessageFromChatGPT: "Mesej dari ChatGPT",
        Share: "Kongsi ke ShareGPT",
        Format: {
        Title: "Format Eksport",
        SubTitle: "Markdown atau Gambar PNG",
        },
        IncludeContext: {
        Title: "Termasuk Konteks",
        SubTitle: "Adakah akan termasuk Masks",
        },
        Steps: {
        Select: "Pilih",
        Preview: "Pratonton",
        },
    },
    Select: {
        Search: "Cari",
        All: "Pilih Semua",
        Latest: "Pilih Terkini",
        Clear: "Bersihkan",
    },
    Memory: {
        Title: "Ingatan Petunjuk",
        EmptyContent: "Belum ada yang tersedia.",
        Send: "Hantar Ingatan",
        Copy: "Salin Ingatan",
        Reset: "Set Semula",
        ResetConfirm:
        "Jika Anda menetap semula, sejarah sembang semasa dan ingatan sejarah akan dipadam. Adakah Anda pasti ingin menetap semula?",
    },
    Home: {
        NewChat: "Sembang Baru",
        DeleteChat: "Adakah Anda pasti ingin memadam perbualan yang dipilih?",
        DeleteToast: "Perbualan telah dipadam",
        Revert: "Kembali",
    },
    Settings: {
        Title: "Tetapan",
        SubTitle: "Semua Tetapan",
        Danger: {
        Reset: {
            Title: "Tetap Semula Semua Tetapan",
            SubTitle: "Kembalikan semua tetapan ke nilai asal",
            Action: "Tetap Semula",
            Confirm:
            "Adakah Anda pasti ingin mengembalikan semua tetapan ke nilai asal?",
        },
        Clear: {
            Title: "Padam Semua Data",
            SubTitle: "Semua data yang disimpan secara lokal akan dipadam",
            Action: "Padam",
            Confirm:
            "Adakah Anda pasti ingin memadam semua data yang disimpan secara lokal?",
        },
        },
        Lang: {
        Name: "Bahasa", 
        All: "Semua Bahasa",
        },
        Avatar: "Avatar",
        FontSize: {
        Title: "Saiz Font",
        SubTitle: "Ubah saiz font kandungan sembang",
        },
        InjectSystemPrompts: {
        Title: "Suntikkan Petunjuk Sistem",
        SubTitle:
            "Tambahkan petunjuk simulasi sistem ChatGPT di awal senarai mesej yang diminta dalam setiap permintaan",
        },
        InputTemplate: {
        Title: "Templat Input",
        SubTitle: "Mesej baru akan diisi menggunakan templat ini",
        },

        Update: {
        Version: (x: string) => `Versi: ${x}`,
        IsLatest: "Versi terkini",
        CheckUpdate: "Semak Kemas Kini",
        IsChecking: "Memeriksa kemas kini...",
        FoundUpdate: (x: string) => `Versi terbaru ditemui: ${x}`,
        GoToUpdate: "Kemas Kini Sekarang",
        },
        AutoGenerateTitle: {
        Title: "Jana Tajuk Secara Automatik",
        SubTitle: "Hasilkan tajuk yang sesuai berdasarkan kandungan perbualan",
        },
        Sync: {
        CloudState: "Kemas Kini Terakhir",
        NotSyncYet: "Belum disegerakkan",
        Success: "Penyegerakan Berjaya",
        Fail: "Penyegerakan Gagal",

        Config: {
            Modal: {
            Title: "Konfigurasi Penyegerakan",
            },
            SyncType: {
            Title: "Jenis Penyegerakan",
            SubTitle: "Pilih perkhidmatan penyegerakan kegemaran Anda",
            },
            Proxy: {
            Title: "Aktifkan Proxy CORS",
            SubTitle:
                "Aktifkan Proxy untuk mengelakkan sekatan atau pemblokiran lintas sumber",
            },
            ProxyUrl: {
            Title: "Lokasi Titik Akhir Proxy CORS",
            SubTitle: "Hanya berlaku untuk Proxy CORS bawaan untuk projek ini",
        },

        WebDav: {
            Endpoint: "Lokasi Titik Akhir WebDAV",
            UserName: "Nama Pengguna",
            Password: "Kata Laluan",
          },
        },
      },
      SendKey: "Hantar",
      Theme: "Tema",
      TightBorder: "Sempadan Ketat",
      SendPreviewBubble: {
        Title: "Pratonton Sembang",
        SubTitle: "Pratonton sembang dengan markdown",
      },
      Mask: {
        Splash: {
          Title: "Skrin Pembuka Masks",
          SubTitle:
            "Paparkan skrin pembuka Masks sebelum memulakan perbualan baru",
        },
        Builtin: {
          Title: "Sembunyi Masks Bawaan",
          SubTitle: "Sembunyikan Masks bawaan dari senarai Masks",
        },
      },
      Prompt: {
        Disable: {
          Title: "Nyahaktifkan Automasi",
          SubTitle: "Hidup/Matikan automasi",
        },
        List: "Senarai Petunjuk",
        ListCount: (builtin: number, custom: number) =>
          `${builtin} bawaan, ${custom} penggunaan khusus`,
        Edit: "Sunting",
        Modal: {
          Title: "Senarai Petunjuk",
          Add: "Tambah",
          Search: "Cari Petunjuk",
        },
        EditModal: {
          Title: "Sunting Petunjuk",
        },
      },
      HistoryCount: {
        Title: "Jumlah Mesej Sejarah",
        SubTitle: "Jumlah mesej yang akan dihantar setiap permintaan",
      },
      CompressThreshold: {
        Title: "Ambang Kompresi Sejarah",
        SubTitle:
          "Jika panjang mesej melebihi had yang ditetapkan, mesej tersebut akan dikompresi",
      },
  
      Usage: {
        Title: "Baki Akaun",
        SubTitle(used: any, total: any) {
          return `Digunakan bulan ini: ${used}, jumlah langganan: ${total}`;
        },
        IsChecking: "Memeriksa...",
        Check: "Semak",
        NoAccess: "Masukkan kunci API untuk memeriksa baki",
      },
  
      Model: "Model",
      Temperature: {
        Title: "Suhu",
        SubTitle: "Semakin tinggi nilainya, semakin rawak keluarannya",
      },
      TopP: {
        Title: "Top P",
        SubTitle: "Tidak mengubah nilai dengan suhu",
      },
      MaxTokens: {
        Title: "Token Maksimum",
        SubTitle: "Panjang maksimum token input dan output",
      },
      PresencePenalty: {
        Title: "Penalti Kehadiran",
        SubTitle: "Semakin tinggi nilai, semakin mungkin topik baru muncul",
      },
      FrequencyPenalty: {
        Title: "Penalti Frekuensi",
        SubTitle:
          "Semakin tinggi nilai, semakin rendah kemungkinan penggunaan ulang baris yang sama",
      },
    },
    Store: {
      DefaultTopic: "Perbualan Baru",
      BotHello: "Halo! Bagaimana saya boleh membantu Anda hari ini?",
      Error: "Terjadi kesalahan, sila cuba lagi nanti.",
      Prompt: {
        History: (content: string) =>
          "Ini adalah ringkasan singkat dari riwayat perbualan: " + content,
        Topic:
          "Buat tajuk berisi empat hingga lima kata untuk perbualan kita yang tidak akan disertakan dalam ringkasan perbualan, seperti arahan, format, petikan, tanda baca awal, tanda petikan pembuka, atau karakter tambahan. Sila cuba dengan petikan berakhir.",
        Summarize:
          "Buat ringkasan perbualan dalam 200 kata yang akan digunakan sebagai petunjuk di masa depan.",
      },
    },
    Copy: {
      Success: "Berjaya disalin ke papan klip",
      Failed:
        "Gagal menyalin, sila berikan izin untuk mengakses papan klip atau API Papan Klip tidak disokong (Tauri)",
    },
    Download: {
      Success: "Kandungan berjaya dimuat turun ke direktori Anda.",
      Failed: "Muat turun gagal.",
    },
    Context: {
      Toast: (x: any) => `Dengan ${x} arahan kontekstual`,
      Edit: "Pengaturan Sembang Semasa",
      Add: "Tambahkan Arahan",
      Clear: "Bersihkan Konteks",
      Revert: "Kembali ke Posisi Sebelumnya",
    },
    Plugin: {
      Name: "Plugin",
    },
    FineTuned: {
      Sysmessage: "Anda adalah asisten yang",
    },
    Mask: {
      Name: "Masks",
      Page: {
        Title: "Templat Arahan",
        SubTitle: (count: number) => `${count} templat arahan`,
        Search: "Cari templat",
        Create: "Buat",
      },
      Item: {
        Info: (count: number) => `${count} arahan`,
        Chat: "Sembang",
        View: "Lihat",
        Edit: "Sunting",
        Delete: "Padam",
        DeleteConfirm: "Anda yakin ingin memadam?",
      },
      EditModal: {
        Title: (readonly: boolean) =>
          `Edit Templat Arahan ${readonly? "(hanya baca)" : ""}`,
        Download: "Muat Turun",
        Clone: "Duplikat",
      },
      Config: {
        Avatar: "Avatar Bot",
        Name: "Nama Bot",
        Sync: {
          Title: "Gunakan Konfigurasi Global",
          SubTitle: "Gunakan konfigurasi global dalam perbualan ini",
          Confirm:
            "Pastikan untuk mengganti konfigurasi kustom dengan konfigurasi global?",
        },
        HideContext: {
          Title: "Sembunyikan Arahan Konteks",
          SubTitle: "Tidak menampilkan arahan konteks dalam obrolan",
        },
        Share: {
          Title: "Kongsi Masks Ini",
          SubTitle: "Buat pautan untuk masks ini",
          Action: "Salin Pautan",
        },
      },
    },
    NewChat: {
      Return: "Kembali",
      Skip: "Langkau",
      Title: "Pilih Masks",
      SubTitle: "Berkonversasi dengan diri anda di balik masks",
      More: "Lebih Lanjut",
      NotShow: "Jangan Tunjukkan Sekarang",
      ConfirmNoShow:
        "Pastikan untuk menonaktifkannya? Anda dapat mengaktifkannya nanti melalui tetapan.",
    },
  
    UI: {
      Confirm: "Sahkan",
      Cancel: "Batal",
      Close: "Tutup",
      Create: "Buat",
      Edit: "Sunting",
    },
    Exporter: {
      Description: {
        Title: "Hanya mesej setelah menghapus konteks yang akan ditampilkan"
      },  
      Model: "Model",
      Messages: "Mesej",
      Topic: "Topik",
      Time: "Tarikh & Waktu",
    },
    URLCommand: {
      Code: "Kod akses terdeteksi dari url, sahkan untuk mendaftar? ",
      Settings: "Tetapan terdeteksi dari url, sahkan untuk diterapkan?",
    },
  };
  
  export default ms;
