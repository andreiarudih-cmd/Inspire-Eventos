const Backup = (function () {

  let lastBackupTime = null;
  let intervalId = null;

  function init() {
    console.log('[Backup] Módulo inicializado');

    if (intervalId) return;

    intervalId = setInterval(() => {
      autoBackup();
    }, 5000); // AGORA EM SEGUNDOS (5s)
  }

  function autoBackup() {
    if (!window.App || !window.App.data) return;
    generateBackup();
  }

  function doBackupNow() {
    generateBackup(true);
  }

  function registerEvent(tipo) {
    const eventos = ['checkin','rsvp_change','guest_edit','event_edit','import'];

    if (eventos.includes(tipo)) {
      generateBackup();
    }
  }

  function generateBackup(manual = false) {
    try {
      const data = window.App?.data || {};
      const evento = window.App?.currentEvent || {};

      if (!evento.id) return;

      const backup = {
        evento_id: evento.id,
        nome_evento: evento.name,
        data_backup: new Date().toISOString(),
        dados: data
      };

      salvarLocalPorEvento(evento.id, backup);

      if (manual) {
        alert('Backup salvo com sucesso!');
      }

      lastBackupTime = new Date();
      console.log('[Backup] OK');

    } catch (e) {
      console.error(e);
    }
  }

  function salvarLocalPorEvento(eventoId, backup) {
    const chave = `backup_evento_${eventoId}`;
    const lista = JSON.parse(localStorage.getItem(chave) || '[]');

    lista.push(backup);

    if (lista.length > 50) {
      lista.shift();
    }

    localStorage.setItem(chave, JSON.stringify(lista));
  }

  return {
    init,
    doBackupNow,
    registerEvent
  };

})();
