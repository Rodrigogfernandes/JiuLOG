// custom-alert.js
// Override global de window.alert com modal não-bloqueante.
(function(){
    if (window.__customAlertInstalled) return;
    window.__customAlertInstalled = true;

    const queue = [];
    let showing = false;

    function ensureDom() {
        if (document.getElementById('custom-alert-modal')) return;

        const modalEl = document.createElement('div');
        modalEl.id = 'custom-alert-modal';
        modalEl.className = 'custom-alert-modal';
        modalEl.style.display = 'none';
        modalEl.innerHTML = `
            <div class="custom-alert-backdrop"></div>
            <div class="custom-alert-card">
                <div class="custom-alert-header"><strong id="custom-alert-title">Aviso</strong></div>
                <div class="custom-alert-body" id="custom-alert-body"></div>
                <div class="custom-alert-actions"><button id="custom-alert-ok" class="btn">OK</button></div>
            </div>
        `;

        const style = document.createElement('style');
        style.id = 'custom-alert-styles';
        style.textContent = '\n' +
            '.custom-alert-modal{position:fixed;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;z-index:99999}\n' +
            '.custom-alert-backdrop{position:absolute;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.45)}\n' +
            '.custom-alert-card{position:relative;background:#fff;color:#111;border-radius:8px;max-width:560px;width:90%;box-shadow:0 12px 36px rgba(0,0,0,0.25);padding:1rem;z-index:1}\n' +
            '.custom-alert-header{font-size:1.05rem;margin-bottom:.5rem}\n' +
            '.custom-alert-body{white-space:pre-wrap;font-size:1rem;margin-bottom:.5rem}\n' +
            '.custom-alert-actions{text-align:right}\n' +
            '.custom-alert-actions .btn{background:#007bff;color:#fff;border:none;padding:.5rem .8rem;border-radius:4px;cursor:pointer}';

        function appendNow(){
            if (!document.head || !document.body) return setTimeout(appendNow, 50);
            if (!document.getElementById('custom-alert-styles')) document.head.appendChild(style);
            if (!document.getElementById('custom-alert-modal')) document.body.appendChild(modalEl);

            const ok = document.getElementById('custom-alert-ok');
            ok && ok.addEventListener('click', () => {
                hideModal();
            });
        }

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', appendNow);
        else appendNow();
    }

    function showModal(message, title) {
        ensureDom();
        showing = true;
        const body = document.getElementById('custom-alert-body');
        const ttl = document.getElementById('custom-alert-title');
        if (body) {
            body.textContent = String(message === undefined ? '' : message);
        }
        const modal = document.getElementById('custom-alert-modal');
        if (modal) modal.style.display = 'flex';
        if (ttl) ttl.textContent = title || 'Aviso';
        document.body && (document.body.style.overflow = 'hidden');
    }

    function hideModal() {
        const modal = document.getElementById('custom-alert-modal');
        if (modal) modal.style.display = 'none';
        document.body && (document.body.style.overflow = 'auto');
        showing = false;
        if (queue.length) {
            const next = queue.shift();
            setTimeout(() => showModal(next), 80);
        }
    }

    // Guardar referencia nativa (se necessário para fallback)
    try { if (!window.__nativeAlert) window.__nativeAlert = window.alert; } catch(e) {}

    // Instrumentação: detectar chamadas ao confirm nativo para localizar eventuais usos remanescentes
    try {
        if (!window.__nativeConfirm) {
            window.__nativeConfirm = window.confirm;
            window.confirm = function(msg){
                try {
                    console.warn('NATIVE confirm() called. Mensagem:', msg);
                    console.trace();
                } catch(e) {}
                return window.__nativeConfirm ? window.__nativeConfirm(msg) : true;
            };
        }
    } catch(e) {}

    window.alert = function(message){
        try {
            queue.push({ message: message, title: undefined });
            if (!showing) {
                const next = queue.shift();
                showModal(next.message, next.title);
            }
        } catch(e) {
            try { window.__nativeAlert && window.__nativeAlert(message); } catch(_) {}
        }
    };

    // Expor uma API compatível: showAlert() aponta para o alert customizado
    try { window.showAlert = function(message, title){
        try {
            queue.push({ message: message, title: title });
            if (!showing) {
                const next = queue.shift();
                showModal(next.message, next.title);
            }
        } catch(e) { try { window.__nativeAlert && window.__nativeAlert(message); } catch(_) {} }
    }; window.showNotification = window.showAlert; } catch(e) {}

    // Implementação interna do modal de confirmação (fila não-bloqueante)
    (function(){
        const queue = [];
        let showing = false;

        function ensureConfirmDom() {
            if (document.getElementById('custom-confirm-modal')) return;
            const modalEl = document.createElement('div');
            modalEl.id = 'custom-confirm-modal';
            modalEl.className = 'custom-confirm-modal';
            modalEl.style.display = 'none';
            modalEl.innerHTML = `
                <div class="custom-confirm-backdrop"></div>
                <div class="custom-confirm-card">
                    <div class="custom-confirm-body" id="custom-confirm-body"></div>
                    <div class="custom-confirm-actions">
                        <button id="custom-confirm-cancel" class="btn btn-outline">Cancelar</button>
                        <button id="custom-confirm-ok" class="btn">Confirmar</button>
                    </div>
                </div>
            `;

            const style = document.createElement('style');
            style.id = 'custom-confirm-styles';
            style.textContent = '\n' +
                '.custom-confirm-modal{position:fixed;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;z-index:100000}\n' +
                '.custom-confirm-backdrop{position:absolute;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.45)}\n' +
                '.custom-confirm-card{position:relative;background:#fff;color:#111;border-radius:8px;max-width:520px;width:90%;box-shadow:0 12px 36px rgba(0,0,0,0.25);padding:1rem;z-index:1}\n' +
                '.custom-confirm-body{white-space:pre-wrap;font-size:1rem;margin-bottom:.75rem}\n' +
                '.custom-confirm-actions{display:flex;gap:8px;justify-content:flex-end}\n' +
                '.custom-confirm-actions .btn{padding:.45rem .8rem;border-radius:4px;cursor:pointer}\n' +
                '.custom-confirm-actions .btn-outline{background:transparent;border:1px solid #ccc}';

            function appendNow(){
                if (!document.head || !document.body) return setTimeout(appendNow, 50);
                if (!document.getElementById('custom-confirm-styles')) document.head.appendChild(style);
                if (!document.getElementById('custom-confirm-modal')) document.body.appendChild(modalEl);
            }

            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', appendNow);
            else appendNow();
        }

        function showNext() {
            if (showing) return;
            const next = queue.shift();
            if (!next) return;
            showing = true;
            ensureConfirmDom();
            const modal = document.getElementById('custom-confirm-modal');
            const body = document.getElementById('custom-confirm-body');
            const btnOk = document.getElementById('custom-confirm-ok');
            const btnCancel = document.getElementById('custom-confirm-cancel');
            if (body) body.textContent = String(next.message === undefined ? '' : next.message);
            if (modal) modal.style.display = 'flex';
            document.body && (document.body.style.overflow = 'hidden');

            function cleanup() {
                if (modal) modal.style.display = 'none';
                showing = false;
                document.body && (document.body.style.overflow = 'auto');
                if (btnOk) btnOk.removeEventListener('click', onOk);
                if (btnCancel) btnCancel.removeEventListener('click', onCancel);
                // small delay to allow animation
                setTimeout(showNext, 80);
            }

            function onOk() { cleanup(); next.resolve(true); }
            function onCancel() { cleanup(); next.resolve(false); }

            if (btnOk) btnOk.addEventListener('click', onOk);
            if (btnCancel) btnCancel.addEventListener('click', onCancel);
        }

        // Expor API: window.confirmModal(message) -> Promise<boolean>
        try {
            window.confirmModal = function(message){
                return new Promise(resolve => {
                    queue.push({ message: message, resolve });
                    // se não está mostrando nada, iniciar
                    setTimeout(showNext, 0);
                });
            };
        } catch(e) { /* ignore */ }
    })();

    // Se existirem alertas disparados antes do carregamento, drenar
    try {
        if (Array.isArray(window.__pendingAlerts) && window.__pendingAlerts.length) {
            window.__pendingAlerts.forEach(a => queue.push(a));
            // limpar o stub
            window.__pendingAlerts = [];
            if (!showing && queue.length) {
                const next = queue.shift();
                setTimeout(() => showModal(next), 10);
            }
        }
    } catch(e) { /* ignore */ }

})();
