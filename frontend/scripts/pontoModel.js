document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const tipoCadastroSelect = document.getElementById('tipoCadastro');
    const camposDinamicosDiv = document.getElementById('campos-dinamicos');
    const form = document.getElementById('form-ponto');
    const btnUsarLocalizacao = document.getElementById('btn-usar-localizacao');
    const latInput = document.getElementById('ponto-latitude');
    const lonInput = document.getElementById('ponto-longitude');
    
    let mapa, marcador;
    const coordenadasIniciais = [-6.8897, -38.5583]; // Cajazeiras

    // --- LÓGICA DO MAPA ---
    function inicializarMapa() {
        mapa = L.map('mapaCadastro').setView(coordenadasIniciais, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);
        marcador = L.marker(coordenadasIniciais, { draggable: true }).addTo(mapa);

        marcador.on('dragend', (e) => atualizarCamposCoordenadas(e.target.getLatLng()));
        mapa.on('click', (e) => {
            marcador.setLatLng(e.latlng);
            atualizarCamposCoordenadas(e.latlng);
        });
    }

    function atualizarCamposCoordenadas(latLng) {
        latInput.value = latLng.lat.toFixed(6);
        lonInput.value = latLng.lng.toFixed(6);
    }
    
    // --- LÓGICA DOS CAMPOS DINÂMICOS (BASEADO NOS MODELS) ---
    function renderizarCamposDinamicos() {
        const tipo = tipoCadastroSelect.value;
        camposDinamicosDiv.innerHTML = ''; // Limpa os campos anteriores

        // Muda o 'name' do input de nome para bater com o model correto
        const nomeInput = document.getElementById('ponto-nome');
        
        if (tipo === 'servico') {
            nomeInput.name = "titulo"; // Model de Serviço usa 'titulo'
            camposDinamicosDiv.innerHTML = `
                <div class="mb-3">
                    <label for="servico-tipo" class="form-label">Tipo de Serviço *</label>
                    <select class="form-select" id="servico-tipo" name="tipo_servico" required>
                        <option value="Hospedagem">Hospedagem</option>
                        <option value="Alimentação/Lazer">Alimentação/Lazer</option>
                        <option value="Ponto Turístico">Ponto Turístico</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="servico-contato" class="form-label">Contato (Telefone, WhatsApp, etc)</label>
                    <input type="text" class="form-control" id="servico-contato" name="contato">
                </div>
            `;
        } else if (tipo === 'evento') {
            nomeInput.name = "nome"; // Model de Evento usa 'nome'
            camposDinamicosDiv.innerHTML = `
                <div class="row">
                    <div class="col-sm-6 mb-3">
                        <label for="evento-data" class="form-label">Data *</label>
                        <input type="date" class="form-control" id="evento-data" name="data" required>
                    </div>
                    <div class="col-sm-6 mb-3">
                        <label for="evento-horario" class="form-label">Horário</label>
                        <input type="time" class="form-control" id="evento-horario" name="horario">
                    </div>
                </div>
                 <div class="mb-3">
                    <label for="evento-local" class="form-label">Local</label>
                    <input type="text" class="form-control" id="evento-local" name="local">
                </div>
            `;
        }
    }

    // --- EVENT LISTENERS ---
    tipoCadastroSelect.addEventListener('change', renderizarCamposDinamicos);

    btnUsarLocalizacao.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const coords = L.latLng(pos.coords.latitude, pos.coords.longitude);
                marcador.setLatLng(coords);
                mapa.panTo(coords);
                atualizarCamposCoordenadas(coords);
            }, () => alert('Não foi possível obter sua localização.'));
        } else {
            alert('Geolocalização não é suportada por este navegador.');
        }
    });

    form.addEventListener('submit', (e) => {
        // ... (A lógica de submit que montava o JSON continua a mesma) ...
    });

    // --- INICIALIZAÇÃO ---
    inicializarMapa();
});