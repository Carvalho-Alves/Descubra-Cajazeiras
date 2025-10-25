// scripts/models/Ponto.js

class Ponto {
    constructor(data) {
        this._id = data._id;
        this.nome = data.nome;
        this.tipo = data.tipo;
        this.descricao = data.descricao;
        this.endereco = data.endereco;
        this.localizacao = data.localizacao;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    getLatLng() {
        // A geolocalização é armazenada como [longitude, latitude] no GeoJSON
        return [this.localizacao.coordinates[1], this.localizacao.coordinates[0]];
    }

    validate() {
        const errors = [];
        if (!this.nome || this.nome.trim().length < 3) {
            errors.push({ field: 'inputNome', message: 'Nome é obrigatório (mín. 3 caracteres).' });
        }
        if (!this.tipo || this.tipo.trim().length === 0) {
            errors.push({ field: 'inputTipo', message: 'Tipo é obrigatório.' });
        }
        if (!this.descricao || this.descricao.trim().length < 10) {
            errors.push({ field: 'inputDescricao', message: 'Descrição é obrigatória (mín. 10 caracteres).' });
        }
        const coords = this.localizacao?.coordinates || [];
        const [lng, lat] = coords;
        if (typeof lat !== 'number' || isNaN(lat)) {
            errors.push({ field: 'inputLatitude', message: 'Latitude inválida.' });
        }
        if (typeof lng !== 'number' || isNaN(lng)) {
            errors.push({ field: 'inputLongitude', message: 'Longitude inválida.' });
        }
        return { valid: errors.length === 0, errors };
    }
}

export default Ponto;