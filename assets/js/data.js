/* Catalog data: barbershop services, team and store products. */
(function () {
  const img = (id, w = 900) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

  const services = [
    { id: "social", name: "Corte social", price: 35, min: 30, desc: "Tesoura e máquina, acabamento na navalha. O clássico que nunca sai de moda.", img: img("1622296089863-eb7fc530daa8") },
    { id: "degrade", name: "Degradê", price: 40, min: 40, desc: "Fade do zero ao topo, transição limpa e marcação precisa.", img: img("1622286342621-4bd786c2447c") },
    { id: "navalhado", name: "Navalhado", price: 45, min: 45, desc: "Degradê finalizado na navalha: pele lisa e contorno afiado.", img: img("1599351431202-1e0f0137899a") },
    { id: "barba", name: "Barba completa", price: 30, min: 30, desc: "Toalha quente, óleo, navalha e balm. Sai outro homem.", img: img("1517832606299-7ae9b720a186") },
    { id: "combo", name: "Corte + Barba", price: 65, min: 70, desc: "O combo da casa. Cabelo e barba alinhados de uma vez.", img: img("1503951914875-452162b0f3f1"), tag: "Mais pedido" },
    { id: "freestyle", name: "Freestyle / Desenho", price: 20, min: 15, desc: "Risco, listra ou desenho autoral. Traz a referência.", img: img("1605497788044-5a32c7078486") },
    { id: "pigmentacao", name: "Pigmentação", price: 25, min: 20, desc: "Preenche falhas e realça o contorno do corte ou da barba.", img: img("1593702288056-7927b442d0fa") },
    { id: "sobrancelha", name: "Sobrancelha", price: 15, min: 10, desc: "Limpeza na navalha ou na pinça, sem exagero.", img: img("1621605815971-fbc98d665033") },
    { id: "platinado", name: "Platinado / Luzes", price: 120, min: 120, desc: "Descoloração com cuidado de fio. Do nevou às luzes discretas.", img: img("1585747860715-2ba37e788b70") },
  ];

  const barbers = [
    { id: "lipe", name: "Lipe Navalha", role: "Navalhado & barba", img: img("1593702288056-7927b442d0fa", 600), stats: { "Degradê": 88, "Barba": 97, "Freestyle": 62 } },
    { id: "dudu", name: "Dudu Fade", role: "Degradê & platinado", img: img("1605497788044-5a32c7078486", 600), stats: { "Degradê": 98, "Barba": 74, "Freestyle": 80 } },
    { id: "theo", name: "Theo Risco", role: "Freestyle & desenho", img: img("1599351431202-1e0f0137899a", 600), stats: { "Degradê": 84, "Barba": 66, "Freestyle": 99 } },
    { id: "any", name: "Sem preferência", role: "Primeiro livre", img: null, stats: null },
  ];

  const gallery = [
    img("1503951914875-452162b0f3f1", 1200),
    img("1622286342621-4bd786c2447c", 800),
    img("1599351431202-1e0f0137899a", 800),
    img("1585747860715-2ba37e788b70", 800),
    img("1517832606299-7ae9b720a186", 800),
    img("1512690459411-b9245aed614b", 1200),
  ];

  const plans = [
    { id: "basico", name: "Básico", price: 89, perks: ["2 cortes por mês", "Sobrancelha inclusa", "Agenda prioritária"] },
    { id: "completo", name: "Completo", price: 149, hot: true, perks: ["4 cortes por mês", "2 barbas completas", "10% off no vestiário", "Agenda prioritária"] },
    { id: "vip", name: "Lenda", price: 219, perks: ["Cortes ilimitados", "Barba ilimitada", "15% off no vestiário", "Bebida por conta da casa"] },
  ];

  // Wardrobe slots group store categories (see vestiario.js).
  const categories = [
    { id: "camisetas", label: "Camisetas" },
    { id: "moletons", label: "Moletons" },
    { id: "calcas", label: "Calças & Bermudas" },
    { id: "tenis", label: "Tênis" },
    { id: "bones", label: "Bonés" },
    { id: "perfumes", label: "Perfumes" },
    { id: "acessorios", label: "Acessórios" },
  ];

  const TOP = ["P", "M", "G", "GG"];
  const PANTS = ["38", "40", "42", "44"];
  const SHOES = ["38", "39", "40", "41", "42", "43"];
  const ONE = ["Único"];

  const products = [
    { id: "tee-grove", name: "Oversized Preta “Grove”", cat: "camisetas", price: 119, sizes: TOP, img: img("1583743814966-8936f5b7be1a"), tag: "Drop" },
    { id: "tee-heavy", name: "Básica Branca Heavy", cat: "camisetas", price: 89, sizes: TOP, img: img("1521572163474-6864f9cf17ab") },
    { id: "tee-original", name: "Estampada “Original”", cat: "camisetas", price: 129, sizes: TOP, img: img("1576566588028-4147f3842f27"), tag: "Novo" },
    { id: "tee-kit", name: "Kit 3 Básicas Coloridas", cat: "camisetas", price: 199, sizes: TOP, img: img("1562157873-818bc0726f68") },
    { id: "hoodie-mescla", name: "Hoodie Cinza Mescla", cat: "moletons", price: 229, sizes: TOP, img: img("1556821840-3a63f95609a7") },
    { id: "crew-off", name: "Moletom Careca Off-white", cat: "moletons", price: 189, sizes: TOP, img: img("1620799140408-edc6dcb6d633") },
    { id: "jeans-reta", name: "Calça Jeans Reta Escura", cat: "calcas", price: 179, sizes: PANTS, img: img("1624378439575-d8705ad7ae80") },
    { id: "jogger-caqui", name: "Jogger Sarja Caqui", cat: "calcas", price: 159, sizes: PANTS, img: img("1473966968600-fa801b869a1a") },
    { id: "jeans-baggy", name: "Calça Jeans Baggy", cat: "calcas", price: 199, sizes: PANTS, img: img("1542272604-787c3835535d"), tag: "Novo" },
    { id: "bermuda-destroyed", name: "Bermuda Jeans Destroyed", cat: "calcas", price: 129, sizes: PANTS, img: img("1591195853828-11db59a44f6b") },
    { id: "runner-red", name: "Runner Vermelho", cat: "tenis", price: 499, sizes: SHOES, img: img("1542291026-7eec264c27ff"), tag: "Drop" },
    { id: "court-caramelo", name: "Court Low Caramelo", cat: "tenis", price: 549, sizes: SHOES, img: img("1549298916-b41d501d3772") },
    { id: "court-pastel", name: "Court Low Pastel", cat: "tenis", price: 529, sizes: SHOES, img: img("1595950653106-6c9ebd614d3a") },
    { id: "air-sunset", name: "Air Runner Sunset", cat: "tenis", price: 599, sizes: SHOES, img: img("1600185365483-26d7a4cc7519"), tag: "Novo" },
    { id: "cap-dad", name: "Dad Hat Cinza Lavado", cat: "bones", price: 79, sizes: ONE, img: img("1521369909029-2afed882baee") },
    { id: "cap-trucker", name: "Trucker Branco", cat: "bones", price: 89, sizes: ONE, img: img("1588850561407-ed78c282e89b") },
    { id: "perf-azul", name: "Azul Noturno EDP 100ml", cat: "perfumes", price: 349, sizes: ["100ml"], img: img("1523293182086-7651a899d37f") },
    { id: "perf-ambar", name: "Âmbar Rosé EDP 100ml", cat: "perfumes", price: 299, sizes: ["100ml"], img: img("1541643600914-78b084683601") },
    { id: "pulseira-riviera", name: "Pulseira Riviera Rosé", cat: "acessorios", price: 149, sizes: ONE, img: img("1611591437281-460bfbe1220a") },
  ];

  products.forEach((p) => { p.thumb = p.img.replace("w=900", "w=240"); });

  window.DATA = { img, services, barbers, gallery, plans, categories, products };
})();
