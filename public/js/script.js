  // Estado da aplicação
  let currentType = 'aluno';
  let currentAction = 'login';
  let academias = [];

  // Criar partículas
  function createParticles() {
      const container = document.getElementById('particles');
      const count = 20;
      
      for (let i = 0; i < count; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          const size = Math.random() * 6 + 3;
          particle.style.width = size + 'px';
          particle.style.height = size + 'px';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.bottom = '-10px';
          particle.style.animationDelay = Math.random() * 15 + 's';
          particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
          container.appendChild(particle);
      }
  }

  // Alternar tipo de usuário
  document.querySelectorAll('.user-type-tab').forEach(tab => {
      tab.addEventListener('click', function() {
          document.querySelectorAll('.user-type-tab').forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          currentType = this.dataset.type;
          updateForms();
      });
  });

  // Alternar ação (login/cadastro)
  document.querySelectorAll('.action-tab').forEach(tab => {
      tab.addEventListener('click', function() {
          document.querySelectorAll('.action-tab').forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          currentAction = this.dataset.action;
          updateForms();
      });
  });

  // Atualizar formulários visíveis
  function updateForms() {
      // Esconder todos os formulários
      document.querySelectorAll('.form-panel').forEach(panel => {
          panel.classList.remove('active');
      });

      // Mostrar formulário correto
      const formId = `form-${currentAction}-${currentType}`;
      const form = document.getElementById(formId);
      if (form) {
          form.classList.add('active');
      }

      // Atualizar título
      const titles = {
          'login-aluno': 'Login Aluno',
          'cadastro-aluno': 'Cadastro de Aluno',
          'login-professor': 'Login Professor',
          'cadastro-professor': 'Cadastro de Professor'
      };
      document.getElementById('header-title').textContent = titles[`${currentAction}-${currentType}`] || 'Bem-vindo';

      // Limpar campos de busca ao mudar de formulário
      if (currentAction === 'cadastro') {
          if (currentType === 'aluno') {
              document.getElementById('academia_search_aluno').value = '';
              document.getElementById('academia_id_aluno').value = '';
              document.getElementById('academia_results_aluno').classList.remove('show');
          } else if (currentType === 'professor') {
              // Resetar para "criar nova"
              document.querySelectorAll('.academia-option-btn').forEach(btn => btn.classList.remove('active'));
              document.querySelector('.academia-option-btn[data-option="nova"]').classList.add('active');
              document.getElementById('academia-nova-container').style.display = 'block';
              document.getElementById('academia-existente-container').style.display = 'none';
              const nomeNovaInit = document.getElementById('academia_nome_nova');
              nomeNovaInit.required = true;
              nomeNovaInit.name = 'academia_nome';
              document.getElementById('academia_search_professor').value = '';
              const idExistenteInit = document.getElementById('academia_id_professor');
              idExistenteInit.value = '';
              idExistenteInit.removeAttribute('name');
              document.getElementById('academia_results_professor').classList.remove('show');
          }
      }
  }

  // Buscar academias (debounced)
  let searchTimeout;
  function searchAcademias(query, resultContainerId, inputId, hiddenId) {
      clearTimeout(searchTimeout);
      
      if (query.length < 2) {
          document.getElementById(resultContainerId).classList.remove('show');
          return;
      }

      searchTimeout = setTimeout(() => {
          fetch(`api/academias/buscar_academias.php?q=${encodeURIComponent(query)}`)
              .then(r => r.json())
              .then(data => {
                  const results = document.getElementById(resultContainerId);
                  results.innerHTML = '';
                  
                  if (data.academias && data.academias.length > 0) {
                      data.academias.forEach(academia => {
                          const item = document.createElement('div');
                          item.className = 'academia-result-item';
                          item.textContent = academia.nome;
                          item.addEventListener('click', () => {
                              document.getElementById(inputId).value = academia.nome;
                              document.getElementById(hiddenId).value = academia.id;
                              results.classList.remove('show');
                          });
                          results.appendChild(item);
                      });
                      results.classList.add('show');
                  } else {
                      results.classList.remove('show');
                  }
              })
              .catch(() => {
                  document.getElementById(resultContainerId).classList.remove('show');
              });
      }, 300);
  }

  // Setup busca de academias para aluno
  const academiaSearchAluno = document.getElementById('academia_search_aluno');
  if (academiaSearchAluno) {
      academiaSearchAluno.addEventListener('input', (e) => {
          searchAcademias(e.target.value, 'academia_results_aluno', 'academia_search_aluno', 'academia_id_aluno');
      });

      // Fechar resultados ao clicar fora
      document.addEventListener('click', (e) => {
          if (!e.target.closest('.academia-search-wrapper')) {
              document.getElementById('academia_results_aluno').classList.remove('show');
          }
      });
  }

  // Setup toggle de opção para professor
  document.querySelectorAll('.academia-option-btn').forEach(btn => {
      btn.addEventListener('click', function() {
          document.querySelectorAll('.academia-option-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          
          const option = this.dataset.option;
          const novaContainer = document.getElementById('academia-nova-container');
          const existenteContainer = document.getElementById('academia-existente-container');
          const nomeNova = document.getElementById('academia_nome_nova');
          
          if (option === 'nova') {
              novaContainer.style.display = 'block';
              existenteContainer.style.display = 'none';
              nomeNova.required = true;
              nomeNova.name = 'academia_nome';
              document.getElementById('academia_id_professor').value = '';
              document.getElementById('academia_id_professor').removeAttribute('name');
          } else {
              novaContainer.style.display = 'none';
              existenteContainer.style.display = 'block';
              nomeNova.required = false;
              nomeNova.value = '';
              nomeNova.removeAttribute('name');
              document.getElementById('academia_id_professor').name = 'academia_id';
          }
      });
  });

  // Setup busca de academias para professor
  const academiaSearchProfessor = document.getElementById('academia_search_professor');
  if (academiaSearchProfessor) {
      academiaSearchProfessor.addEventListener('input', (e) => {
          searchAcademias(e.target.value, 'academia_results_professor', 'academia_search_professor', 'academia_id_professor');
      });

      // Fechar resultados ao clicar fora
      document.addEventListener('click', (e) => {
          if (!e.target.closest('.academia-search-wrapper')) {
              document.getElementById('academia_results_professor').classList.remove('show');
          }
      });
  }

  // Mostrar alerta
  function showAlert(message, type = 'error') {
      const container = document.getElementById('alert-container');
      const alert = document.createElement('div');
      alert.className = `alert alert-${type}`;
      alert.innerHTML = `
          <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
          <span>${message}</span>
      `;
      container.innerHTML = '';
      container.appendChild(alert);

      setTimeout(() => {
          alert.classList.add('hidden');
          setTimeout(() => alert.remove(), 300);
      }, 5000);
  }

  // File input preview
  document.getElementById('academia_logo')?.addEventListener('change', function(e) {
      const file = e.target.files[0];
      const label = document.getElementById('file-label-text');
      if (file) {
          label.textContent = file.name;
      } else {
          label.textContent = 'Logomarca da academia (opcional)';
      }
  });

  // Validação do formulário de cadastro do professor
  document.getElementById('form-cadastro-professor')?.addEventListener('submit', function(e) {
      const activeOption = document.querySelector('.academia-option-btn.active')?.dataset.option;
      if (!activeOption) return;
      
      const nomeNova = document.getElementById('academia_nome_nova');
      const idExistente = document.getElementById('academia_id_professor').value;
      
      if (activeOption === 'nova' && !nomeNova.value.trim()) {
          e.preventDefault();
          showAlert('Por favor, informe o nome da nova academia', 'error');
          const btn = this.querySelector('button[type="submit"]');
          btn.classList.remove('loading');
          btn.disabled = false;
          return false;
      }
      
      if (activeOption === 'existente' && !idExistente) {
          e.preventDefault();
          showAlert('Por favor, selecione uma academia existente', 'error');
          const btn = this.querySelector('button[type="submit"]');
          btn.classList.remove('loading');
          btn.disabled = false;
          return false;
      }
  });

  // Submissão de formulários
  document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function(e) {
          const btn = this.querySelector('button[type="submit"]');
          btn.classList.add('loading');
          btn.disabled = true;
      });
  });

  // Verificar erro na URL
  const params = new URLSearchParams(window.location.search);
  if (params.has('erro')) {
      showAlert('Email ou senha incorretos!', 'error');
      params.delete('erro');
      window.history.replaceState({}, '', window.location.pathname);
  }

  // Inicializar
  document.addEventListener('DOMContentLoaded', () => {
      createParticles();
      updateForms();
  });