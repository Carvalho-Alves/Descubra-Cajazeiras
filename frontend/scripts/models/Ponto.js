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
        return [this.localizacao.coordinates[1], this.localizacao.coordinates[0]];
    }

    validate() {
        const errors = [];
        if (!this.nome || this.nome.trim() === '') {
            errors.push('O nome do ponto é obrigatório.');
        }
        if (!this.tipo || this.tipo.trim() === '') {
            errors.push('O tipo do ponto é obrigatório.');
        }
        if (!this.localizacao || !this.localizacao.coordinates || this.localizacao.coordinates.length !== 2) {
            errors.push('As coordenadas de localização são obrigatórias.');
        }
        
        const [lng, lat] = this.localizacao.coordinates;
        if (isNaN(lng) || isNaN(lat)) {
            errors.push('As coordenadas devem ser números válidos.');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

export default Ponto;