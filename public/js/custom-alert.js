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

        function appendNow(){
            if (!document.head || !document.body) return setTimeout(appendNow, 50);
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
        let currentResolve = null;
        let currentOkHandler = null;
        let currentCancelHandler = null;

        function ensureConfirmDom() {
            // Se já existe o modal no DOM, apenas retornar
            const existing = document.getElementById('custom-confirm-modal');
            if (existing) {
                return; // Já existe, não criar outro
            }

            // Remover qualquer modal duplicado que possa existir
            const allModals = document.querySelectorAll('.custom-confirm-modal');
            allModals.forEach(modal => {
                if (modal.id !== 'custom-confirm-modal') {
                    modal.remove();
                }
            });

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

            function appendNow(){
                if (!document.head || !document.body) return setTimeout(appendNow, 50);
                if (!document.getElementById('custom-confirm-modal')) document.body.appendChild(modalEl);
            }

            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', appendNow);
            else appendNow();
        }

        function cleanup() {
            // Se não está mostrando, não fazer nada
            if (!showing) {
                return;
            }
            
            const modal = document.getElementById('custom-confirm-modal');
            if (modal) {
                modal.style.display = 'none';
                // Remover classes ativas
                modal.classList.remove('active');
            }
            
            showing = false;
            document.body && (document.body.style.overflow = 'auto');
            
            // Remover event listeners
            const btnOk = document.getElementById('custom-confirm-ok');
            const btnCancel = document.getElementById('custom-confirm-cancel');
            if (btnOk && currentOkHandler) {
                btnOk.removeEventListener('click', currentOkHandler);
            }
            if (btnCancel && currentCancelHandler) {
                btnCancel.removeEventListener('click', currentCancelHandler);
            }
            
            // Limpar referências
            currentOkHandler = null;
            currentCancelHandler = null;
            const resolve = currentResolve;
            currentResolve = null;
            
            // Pequeno delay para permitir animação antes de mostrar próximo
            setTimeout(() => {
                // Verificar novamente se não está mostrando antes de mostrar próximo
                if (!showing) {
                    showNext();
                }
            }, 150);
        }

        function showNext() {
            // Se já está mostrando, não fazer nada
            if (showing) {
                return;
            }
            
            // Se não há nada na fila, não fazer nada
            if (queue.length === 0) {
                return;
            }
            
            const next = queue.shift();
            if (!next) {
                return;
            }
            
            showing = true;
            currentResolve = next.resolve;
            ensureConfirmDom();
            
            const modal = document.getElementById('custom-confirm-modal');
            const body = document.getElementById('custom-confirm-body');
            const btnOk = document.getElementById('custom-confirm-ok');
            const btnCancel = document.getElementById('custom-confirm-cancel');
            
            if (!modal || !body || !btnOk || !btnCancel) {
                console.error('[confirmModal] Elementos do modal não encontrados');
                showing = false;
                if (currentResolve) {
                    currentResolve(false);
                    currentResolve = null;
                }
                setTimeout(showNext, 100);
                return;
            }
            
            body.textContent = String(next.message === undefined ? '' : next.message);
            
            // Garantir que apenas este modal esteja visível
            modal.style.display = 'flex';
            modal.classList.add('active');
            document.body && (document.body.style.overflow = 'hidden');
            
            // Forçar foco no modal para evitar cliques acidentais fora
            modal.focus();

            function onOk(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // Resolver antes de limpar para evitar race conditions
                const resolve = currentResolve;
                cleanup();
                
                if (resolve) {
                    resolve(true);
                }
            }
            
            function onCancel(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // Resolver antes de limpar para evitar race conditions
                const resolve = currentResolve;
                cleanup();
                
                if (resolve) {
                    resolve(false);
                }
            }

            // Remover listeners anteriores se existirem
            if (currentOkHandler) {
                btnOk.removeEventListener('click', currentOkHandler);
            }
            if (currentCancelHandler) {
                btnCancel.removeEventListener('click', currentCancelHandler);
            }

            // Adicionar novos listeners
            currentOkHandler = onOk;
            currentCancelHandler = onCancel;
            btnOk.addEventListener('click', onOk);
            btnCancel.addEventListener('click', onCancel);
            
            // Fechar ao clicar no backdrop
            const backdrop = modal.querySelector('.custom-confirm-backdrop');
            if (backdrop) {
                // Remover listener anterior se existir
                const existingHandler = backdrop._backdropHandler;
                if (existingHandler) {
                    backdrop.removeEventListener('click', existingHandler);
                }
                
                const backdropHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    backdrop.removeEventListener('click', backdropHandler);
                    onCancel(e);
                };
                
                // Guardar referência para poder remover depois
                backdrop._backdropHandler = backdropHandler;
                backdrop.addEventListener('click', backdropHandler);
            }
        }

        // Expor API: window.confirmModal(message) -> Promise<boolean>
        try {
            window.confirmModal = function(message){
                // Se já está mostrando um modal, adicionar à fila
                if (showing) {
                    console.warn('[confirmModal] Já existe um modal aberto, adicionando à fila');
                }
                return new Promise(resolve => {
                    queue.push({ message: message, resolve });
                    // Se não está mostrando nada, iniciar
                    if (!showing) {
                        setTimeout(showNext, 0);
                    }
                });
            };
        } catch(e) {
            console.error('[confirmModal] Erro ao criar função:', e);
        }
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
