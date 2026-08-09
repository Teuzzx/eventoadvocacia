-- Permite que usuários autenticados (painel admin) excluam inscrições
create policy "admin_pode_excluir"
    on public.inscricoes
    for delete
    to authenticated
    using (true);
