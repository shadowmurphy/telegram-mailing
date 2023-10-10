const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
require("dotenv").config()
const input = require("input");

const db = require('./functions/dbService');

const apiId = process.env.API_ID;
const apiHash = process.env.HASH_ID;

async function start() {

  let sessionString;

  try {
    sessionString = await db.getSession();
  } catch {}

  const session = sessionString 
    ? new StringSession(sessionString)
    : new StringSession();

  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5
  });

  if (!sessionString) {
    await client.start({
      phoneNumber: async () => await input.text("Номер телефона: "),
      password: async () => await input.text("Пароль: "),
      phoneCode: async () => await input.text("Код из смс: "),
      onError: (err) => console.log(err),    
    });
    console.log("Сохраняем сессию...");
    await db.saveSession(client.session.save());
  } else await client.connect();
  console.log("Авторизовались!");

  const result = await client.invoke(
    new Api.channels.GetParticipants({
      channel: await input.text("Введите юзернейм канала: "),
      filter: new Api.ChannelParticipantsRecent(),
      offset: 0,
      limit: 5000,
      hash: 0
    })
  );
  for(const user of result.users) {
    if (isSent(user.id)) continue;
    try {
      await client.sendMessage(user.id, {
        message: 'Привет) Зачем вы это сделали?\n\nНедавно вы подключились в интенсив по крипте, который я проводил - @intensivchillinvest  и я так и не понял, вы смотрели материалы или не смогли?\n\nСпрашиваю для того, чтобы очистить подписчиков, которым это не интересно. Вам в целом интересно дальше работать с криптой?'
      });
    } catch (e) {
      console.log(e)
    }
    await new Promise(resolve => setTimeout(resolve, 15000));
    db.saveLog(user.id)
    console.log(`Sended to: ${user.id}`)
  }
  console.log('Рассылка завершена');
}

start();

function isSent(userId) {
  return db.getLog().includes(userId);
}