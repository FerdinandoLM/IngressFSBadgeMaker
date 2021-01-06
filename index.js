var needle = require('needle');
const Telegram = require('node-telegram-bot-api')
const { createCanvas, loadImage, ImageData } = require('canvas')
const RGBQuant = require('rgbquant')


const quants = {
  res: new RGBQuant({
    colors: require('./palettes.json').resistance.length,
    palette: require('./palettes.json').resistance
  }),
  enl: new RGBQuant({
    colors: require('./palettes.json').enlightened.length,
    palette: require('./palettes.json').enlightened
  })
}

const factions = {}


token="1388053819:AAH5rhk1LHyNK8_aK_amLlZgyzlIqjaLAc4"
const bot = new Telegram(token, { polling: true })

bot.on('message', async (msg) => {
  if (msg.photo) {
    if (factions[msg.chat.id]) {
      console.log(`Generating badge for ${msg.from.first_name} (${msg.from.username})...`)
      bot.sendChatAction(msg.chat.id, 'upload_photo').catch(console.error)
      const pictureCanvas = createCanvas(559, 772)
      const pictureCtx = pictureCanvas.getContext('2d')
      const { file_path } = await bot.getFile(msg.photo[msg.photo.length - 1].file_id)
      const picture = await loadImage(`https://api.telegram.org/file/bot${token}/${file_path}`)
      //here i calculate proportions
      pheight = picture.height
      console.log(pheight)
      pwidth = picture.width
      console.log(pwidth)
      aspectratiow = (pwidth/pheight)
      aspectratioh = (pheight/pwidth)
      console.log(aspectratiow)
      console.log(aspectratioh)
      oheight = pheight*aspectratioh
      console.log(oheight)
      owidth = (pwidth) / (pwidth/559)
      console.log(owidth)
      newheight = 559*pheight/pwidth
      var scale = Math.min(559/pwidth, 772/pheight);
      var posx = (559 / 2) - (559 / 2) * scale;
      var posy = (772 / 2) - (pheight / 2) * scale;
      pictureCtx.drawImage(picture, 10 , posy, 559, newheight)

      const finalCanvas = createCanvas(559, 772)
      const finalCtx = finalCanvas.getContext('2d')
      const frame = await loadImage(`./frames/${factions[msg.chat.id]}.png`)
      finalCtx.drawImage(pictureCanvas, 0, 0, 559, 772)
      finalCtx.drawImage(frame, 0, 0, 559, 772)
      factions[msg.chat.id] = null
      bot.sendPhoto(msg.chat.id, finalCanvas.toBuffer('image/jpeg', { quality: 1 }))
    } else {
      bot.sendMessage(msg.chat.id, 'Scrivi /enl1 /enl2 /enl3 o /res1 /res2 /res3 o /xf1 /xf2 !').catch(console.log)
    }
  }
})

bot.onText(/\/start/, async (msg) => {
  bot.sendMessage(msg.chat.id, "Benvenuti nel bot dedicato alle biocard IFS. Devi dirmi che card vuoi fare prima!\n\nScegli /enl1 o /res1 per decorazioni e con testo fazione \nScegli /enl2 o /res2 per la cornice senza decorazioni\nScegli /enl3 o /res3 per cornice base senza testo\nScegli /xf1 o /xf2 per una cornice cross-faction (con o senza decorazioni)\nContatta @FerdinandoLM per ulteriori informazioni.\n(Nota privacy: Il server cancella le immagini dopo averle generate, quindi salvala se vuoi conservarla!)\n(dev: fork di: gh:pedrofracassi/badgemaker)").catch(console.log)
})

bot.onText(/\/(enl1|enl2|enl3|res1|res2|res3|xf1|xf2)/, async (msg, match) => {
  factions[msg.chat.id] = match[1]
  bot.sendMessage(msg.chat.id, 'Bene! Adesso inviami la foto che vuoi modificare. Foto leggermente rettangolari verso l\'altezza sono l\'ideale. Non farle troppo alte o troppo larghe, altrimenti vengono schiacciate.').catch(console.log)
})
