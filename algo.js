// İxtisas sıralaması yapmak için genetik algoritma örneği
const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
  
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
  
    return array;
  };
// İxtisas verilerini temsil eden örnek bir dizi
const ixtisaslar = [
    { isim: '1', planlamaYeri: 165, gecisBalFarki: 62 },
    { isim: '2', planlamaYeri: 100, gecisBalFarki: 65 },
    { isim: '3', planlamaYeri: 25, gecisBalFarki: 27 },
    { isim: '4', planlamaYeri: 155, gecisBalFarki: 64 },
    { isim: '5', planlamaYeri: 40, gecisBalFarki: 56 },
  ];
  const cocukBal = 500
  // Çocuğun topladığı bal
// Fisher-Yates shuffle function
  // Genetik algoritma fonksiyonu
  // Genetik algoritma fonksiyonu
  const genetikAlgoritma = (ixtisaslar, cocukBal, populasyonBoyutu, nesilSayisi, caprazlamaOrani, mutasyonOrani) => {
    const uygunlukFonksiyonu = (siralama) => {
      let toplamBal = 0;
      for (let i = 0; i < siralama.length; i++) {
        const ixtisas = ixtisaslar[siralama[i]];
        toplamBal += ixtisas.gecisBalFarki + ixtisas.planlamaYeri + cocukBal;
      }
      return toplamBal;
    };
  
    const caprazlama = (ebeveyn1, ebeveyn2) => {
      const caprazlamaNoktasi = Math.floor(Math.random() * ebeveyn1.length);
      const cocuk = [...ebeveyn1.slice(0, caprazlamaNoktasi), ...ebeveyn2.slice(caprazlamaNoktasi)];
      return cocuk;
    };
  
    const mutasyon = (siralama) => {
      const indeks1 = Math.floor(Math.random() * siralama.length);
      const indeks2 = Math.floor(Math.random() * siralama.length);
      const yeniSiralama = [...siralama];
      [yeniSiralama[indeks1], yeniSiralama[indeks2]] = [yeniSiralama[indeks2], yeniSiralama[indeks1]];
      return yeniSiralama;
    };
  
    let populasyon = [];
    for (let i = 0; i < populasyonBoyutu; i++) {
      const ixtisasSiralama = shuffle([...Array(ixtisaslar.length).keys()]);
      populasyon.push(ixtisasSiralama);
    }
  
    for (let nesil = 0; nesil < nesilSayisi; nesil++) {
      populasyon.sort((a, b) => uygunlukFonksiyonu(b) - uygunlukFonksiyonu(a));
  
      const elitPopulasyon = populasyon.slice(0, populasyonBoyutu / 10);
  
      const yeniPopulasyon = [];
      while (yeniPopulasyon.length < populasyonBoyutu - elitPopulasyon.length) {
        const turnuvaGrubu = populasyon.slice(0, 10);
        const ebeveyn1 = turnuvaGrubu[Math.floor(Math.random() * turnuvaGrubu.length)];
        const ebeveyn2 = turnuvaGrubu[Math.floor(Math.random() * turnuvaGrubu.length)];
        const cocuk = caprazlama(ebeveyn1, ebeveyn2);
        if (Math.random() < mutasyonOrani) {
          mutasyon(cocuk);
        }
        yeniPopulasyon.push(cocuk);
      }
  
      populasyon = elitPopulasyon.concat(yeniPopulasyon);
      console.log(`Nesil ${nesil + 1} - En iyi uygunluk: ${uygunlukFonksiyonu(populasyon[0])}`);
    }
  
    populasyon.sort((a, b) => uygunlukFonksiyonu(b) - uygunlukFonksiyonu(a));
    const enIyiSiralama = populasyon[0];
  
    return enIyiSiralama;
  };
  
  // Verilen ixtisaslar ve çocuğun balı ile genetik algoritmayı çalıştır
  const enIyiSiralama = genetikAlgoritma(ixtisaslar, cocukBal, 100, 100, 0.7, 0.1);
  
  console.log('En iyi ixtisas sıralaması:', enIyiSiralama.map((index) => ixtisaslar[index].isim));
  
  