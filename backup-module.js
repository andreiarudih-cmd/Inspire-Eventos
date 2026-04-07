const Backup = (function () {

  let lastBackupTime = null;
  let intervalId = null;

  //--------------------------------------------------
  // INIT
  //--------------------------------------------------
  function init() {
    console.log('[Backup] Módulo inicializado');

    // Evita múltiplos intervals
    if (intervalId) return;

    // Backup automático a cada 5 minutos
    intervalId = setInterval(() => {
      autoBackup();
    }, 5 * 60 * 1000);

    atualizarStatus();
  }

  //--------------------------------------------------
  // BACKUP AUTOMÁTICO
  //--------------------------------------------------
  function autoBackup() {
    if (!window.App || !window.App.data) {
      console.warn('[Backup] App não disponível para backup');
      return;
    }

    console.log('[Backup] Executando backup automático...');
    generateBackup(false);
  }

  //--------------------------------------------------
  // BACKUP MANUAL
  //--------------------------------------------------
  function doBackupNow() {
    console.log('[Backup] Backup manual iniciado...');
    generateBackup(true);
  }

  //--------------------------------------------------
  // REGISTRO DE EVENTOS (CHECK-IN, RSVP, ETC)
  //--------------------------------------------------
  function registerEvent(tipo) {
    console.log('[Backup] Evento registrado:', tipo);

    const eventosCriticos = ['checkin', 'rsvp_change', 'guest_edit'];

    if (eventosCriticos.includes(tipo)) {
      generateBackup(false);
    }
  }

  //--------------------------------------------------
  // GERAR BACKUP
  //--------------------------------------------------
  function generateBackup(manual = false) {
    try {
      const data = window.App?.data || {};
      const evento = window.App?.currentEvent || {};

      const backup = {
        evento_id: evento?.id || null,
        nome_evento: evento?.name || 'evento',
        data_backup: new Date().toISOString(),
        dados: data
      };

      const json = JSON.stringify(backup, null, 2);

      salvarLocal(json);

      if (manual) {
        alert('Backup salvo com sucesso!');
      }

      lastBackupTime = new Date();
      atualizarStatus();

      console.log('[Backup] Backup realizado com sucesso');

    } catch (e) {
      console.error('[Backup] Erro ao gerar backup:', e);
    }
  }

  //--------------------------------------------------
  // SALVAR LOCAL (LOCALSTORAGE)
  //--------------------------------------------------
  function salvarLocal(json) {
    try {
      const backups = JSON.parse(localStorage.getItem('backups') || '[]');

      backups.push(json);

      // Mantém apenas os últimos 20 backups
      if (backups.length > 20) {
        backups.shift();
      }

      localStorage.setItem('backups', JSON.stringify(backups));

    } catch (e) {
      console.error('[Backup] Erro ao salvar local:', e);
    }
  }

  //--------------------------------------------------
  // EXPORTAR BACKUP (DOWNLOAD)
  //--------------------------------------------------
  function exportarBackup() {
    try {
      const backups = JSON.parse(localStorage.getItem('backups') || '[]');

      if (!backups.length) {
        alert('Nenhum backup disponível');
        return;
      }

      const ultimo = backups[backups.length - 1];

      const blob = new Blob([ultimo], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-evento-${new Date().toISOString()}.json`;
      a.click();

      URL.revokeObjectURL(url);

    } catch (e) {
      console.error('[Backup] Erro ao exportar:', e);
    }
  }

  //--------------------------------------------------
  // RESTAURAR BACKUP
  //--------------------------------------------------
  function restaurarBackup(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const backup = JSON.parse(e.target.result);

        if (!backup || !backup.dados) {
          alert('Arquivo inválido');
          return;
        }

        if (!window.App) {
          alert('Sistema não disponível');
          return;
        }

        window.App.data = backup.dados;

        alert('Backup restaurado com sucesso!');

        location.reload();

      } catch (err) {
        console.error('[Backup] Erro ao restaurar:', err);
        alert('Erro ao restaurar backup');
      }
    };

    reader.readAsText(file);
  }

  //--------------------------------------------------
  // STATUS NA TELA
  //--------------------------------------------------
  function atualizarStatus() {
    const el = document.getElementById('backup-status');
    const elTime = document.getElementById('backup-last-time');

    if (el) {
      el.innerText = lastBackupTime
        ? 'Backup ativo'
        : 'Nenhum backup ainda';
    }

    if (elTime && lastBackupTime) {
      elTime.innerText = `Último backup: ${lastBackupTime.toLocaleTimeString()}`;
    }
  }

  //--------------------------------------------------
  // API PÚBLICA
  //--------------------------------------------------
  return {
    init,
    doBackupNow,
    registerEvent,
    exportarBackup,
    restaurarBackup
  };

})();