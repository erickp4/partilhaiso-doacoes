const API = 'http://localhost:3001';

// Liga ou desliga o "seguir" e devolve a lista atualizada de ids seguidos
export async function alternarSeguir(instituicaoId){
    const usuario = await fetch(`${API}/usuario`).then(r => r.json());
    const lista = usuario.seguindo || [];

    const novaLista = lista.includes(instituicaoId)
        ? lista.filter(id => id !== instituicaoId)
        : [...lista, instituicaoId];

    const resposta = await fetch(`${API}/usuario`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seguindo: novaLista })
    });

    if (!resposta.ok) throw new Error('falhou');

    return novaLista;
}