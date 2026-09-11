// Starter list — PERLU DIREVIEW & DIKURASI TIM sebelum production.
// Dipakai oleh authGuard.ts untuk validasi registrasi (email prefix palsu & nama/SARA).

export const EMAIL_PREFIX_BLOCKLIST = [
  // Kata buangan / percobaan (Bawaan)
  'test', 'demo', 'admin', 'contoh', 'coba', 'tes', 'sample', 'fake', 'dummy',
  'noreply', 'no-reply', 'null', 'asdf', 'qwerty', 'user', 'guest', 'anonymous',
  'temp', 'spam', 'abuse', 'example',

  // Role-based & System emails (Sering dipakai untuk bypass atau bot)
  'info', 'contact', 'support', 'sales', 'webmaster', 'postmaster', 'hostmaster',
  'root', 'bot', 'system', 'sysadmin', 'mailer-daemon', 'donotreply', 'billing',
  'hello', 'marketing', 'office', 'help', 'administrator', 'security',

  // Disposable / Keyboard mashing
  'junk', 'trash', 'throwaway', '12345', '123456', 'qwertyuiop', 'asdfghjkl', 'mailinator'
];

// Deteksi pola "test123", "test2", "admin99", dst.
// Ditambahkan beberapa prefix tambahan seperti bot, spam, temp, info, guest
export const EMAIL_PREFIX_HEURISTIC =
  /^(test|demo|admin|user|contoh|coba|tes|sample|fake|dummy|bot|spam|temp|info|guest)\d*$/i;

// Starter list kata kasar/SARA/Vulgar umum Bahasa Indonesia.
// Harap direview kembali sebelum masuk ke production untuk menghindari false-positive
// (misal: memblokir nama orang yang secara kebetulan mengandung suku kata ini).
export const RESTRICTED_WORDS_ID: string[] = [
  // Nama Hewan (Konteks Makian)
  'anjing', 'babi', 'monyet', 'kunyuk', 'beruk', 'celeng', 'kampret',

  // Umpatan Kasar Umum
  'bangsat', 'bajingan', 'keparat', 'brengsek', 'sialan', 'tai', 'jancok',
  'dancok', 'asu', 'asyu', 'jadah', 'bedebah', 'pukimak', 'pantek',

  // Pornografi / Alat Kelamin / Vulgar
  'kontol', 'memek', 'jembut', 'ngentot', 'puki', 'kimak', 'kimbek',
  'peler', 'pepek', 'tempik', 'itil', 'silit', 'toket', 'tete', 'ngewe',
  'kentu', 'entot', 'sange', 'bokep', 'colmek', 'coli',

  // Prostitusi & Pelecehan
  'lonte', 'perek', 'pelacur', 'jablay', 'bitch', 'sundel', 'lont', 'ayamkampus',

  // Merendahkan Kecerdasan/Fisik/Kondisi
  'goblok', 'tolol', 'bego', 'dungu', 'idiot', 'cacat', 'bencong', 'banci', 'maho',

  // SARA / Sentimen Golongan & Politik Kasar (Hate Speech)
  'kafir', 'onta', 'kadrun', 'cebong', 'tiko', 'cimed', 'kling'
];