// Карта ассетов урока намаза: картинки и аудио.
//
// React Native bundler не умеет require() с динамическим путём — поэтому
// все ресурсы перечисляются здесь явно. В prayerLesson.js на каждый шаг
// указывается строковый ключ (image, audio), а это файл резолвит модуль.

export const PRAYER_IMAGES = {
  niet:           require('../../assets/prayer/images/niet.png'),
  takbir:         require('../../assets/prayer/images/takbir.png'),
  qyam:           require('../../assets/prayer/images/qyam.png'),
  ruku:           require('../../assets/prayer/images/ruku.png'),
  sajda:          require('../../assets/prayer/images/sajda.png'),
  tashahud:       require('../../assets/prayer/images/tashahud.png'),
  tashahud_legs:  require('../../assets/prayer/images/tashahud_legs.png'),
  salam_left:     require('../../assets/prayer/images/salam_left.png'),
  salam_right:    require('../../assets/prayer/images/salam_right.png'),
  dua:            require('../../assets/prayer/images/dua.png'),
};

export const PRAYER_AUDIO = {
  takbir:                require('../../assets/prayer/audio/takbir.mp3'),
  subhanaka_istiaza:     require('../../assets/prayer/audio/subhanaka_istiaza.mp3'),
  subhanaka:             require('../../assets/prayer/audio/subhanaka.mp3'),
  istiaza_basmala:       require('../../assets/prayer/audio/istiaza_basmala.mp3'),
  basmala:               require('../../assets/prayer/audio/basmala.mp3'),
  fatiha:                require('../../assets/prayer/audio/fatiha.mp3'),
  fatiha_kausar:         require('../../assets/prayer/audio/fatiha_kausar.mp3'),
  fatiha_ikhlas:         require('../../assets/prayer/audio/fatiha_ikhlas.mp3'),
  ihlas:                 require('../../assets/prayer/audio/ihlas.mp3'),
  dua_ruku:              require('../../assets/prayer/audio/dua_ruku.mp3'),
  samiallah_rabbana:     require('../../assets/prayer/audio/samiallah_rabbana.mp3'),
  dua_sudjud:            require('../../assets/prayer/audio/dua_sudjud.mp3'),
  attahiyat:             require('../../assets/prayer/audio/attahiyat.mp3'),
  attahiyat_salavat_dua: require('../../assets/prayer/audio/attahiyat_salavat_dua.mp3'),
  attahiyat_salavat:     require('../../assets/prayer/audio/attahiyat_salavat.mp3'),
  rabbana:               require('../../assets/prayer/audio/rabbana.mp3'),
  salam:                 require('../../assets/prayer/audio/salam.mp3'),
  salam_r:               require('../../assets/prayer/audio/salam_r.mp3'),
  salam_l:               require('../../assets/prayer/audio/salam_l.mp3'),
  dua_posle_namaza:      require('../../assets/prayer/audio/dua_posle_namaza.mp3'),
};

export function getPrayerImage(key) {
  return key ? PRAYER_IMAGES[key] : null;
}

export function getPrayerAudio(key) {
  return key ? PRAYER_AUDIO[key] : null;
}
