const request = require("request-promise");
const cheerio = require("cheerio");
const Crawler = require("crawler");
const { Parser } = require("json2csv");
const fs = require("fs");

const URLPAI = "https://myanimelist.net/topanime.php";

/*Função responsável por criar todos os links pai */
async function extraiUrlPai() {
  const requisicao = await request(URLPAI);
  let $ = cheerio.load(requisicao);
  let totpgsPai = 16100;
  let count = 0;

  while (count <= totpgsPai) {
    const urlsFilhos = "https://myanimelist.net/topanime.php?limit=" + count;
    //console.log([urlsFilhos])
    extLinksPais.queue([urlsFilhos]);
    count += 50;
  }
}

/*Função responsável por extrair links de filhos de pagina pai */
const extLinksPais = new Crawler({
  rateLimit: 5000,
  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      const $ = res.$;
      $("a[class='hoverinfo_trigger fl-l fs14 fw-b']").each(function(i, link) {
        let links = $(link).attr("href");
        let linksArr = links.split("\n");
        // console.log(linksArr);
        crawpgFilha.queue(linksArr);
      });
    }
    done();
  }
});

/*Função responsável por extrair informações individuais dos animes */
let animesDados = [];
const crawpgFilha = new Crawler({
  rateLimit: 5000,
  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      let $ = res.$;

      let nome = $("h1 > span[itemprop='name']")
        .text()
        .trim();

      let nota = $("div[class='fl-l score']")
        .text()
        .trim();

      let ranked = $("span[class='numbers ranked']").text();

      let synopsis = $("span[itemprop='description']")
        .text()
        .replace("[Written by MAL Rewrite]", "");
      console.log(`${nome} - ${nota} -${ranked} - ${synopsis}`);

      animesDados.push({
        nome,
        nota,
        ranked,
        synopsis
      });
    }
    done();
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(animesDados);
    console.log(csv);
    fs.writeFileSync("./dados-animes.csv", csv, "utf-8");
  }
});

extraiUrlPai();
