-- ============================================================
-- BANCO DE DADOS — Workshop Previdenciário (Supabase)
-- Como usar:
--   1. Crie um projeto gratuito em https://supabase.com
--   2. Vá em "SQL Editor" → "New query"
--   3. Cole e execute TODO este arquivo
-- ============================================================

-- ---------- Tabela de inscrições ----------
create table if not exists public.inscricoes (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),

    nome text not null,
    email text not null,
    whatsapp text not null,
    oab_cpf text not null,

    -- Senha única de acesso ao evento (gerada na inscrição)
    -- O inscrito apresenta no celular na entrada; o painel confere
    codigo_acesso text unique,
    checkin_at timestamptz,

    tipo_inscricao text not null default 'Inscrição Normal',
    valor_pago numeric not null default 90,
    cupom_utilizado text,
    desconto_aplicado text default 'Nenhum',

    -- Status do fluxo:
    -- 'pendente'   = inscrição recebida, aguardando pagamento
    -- 'pago'       = pagamento confirmado (webhook Mercado Pago)
    -- 'confirmado' = coordenação confirmou presença/inscrição
    -- 'cancelado'  = cancelado pela coordenação
    status text not null default 'pendente'
        check (status in ('pendente', 'pago', 'confirmado', 'cancelado')),

    -- Liberação do certificado (manual, pelo painel admin)
    certificado_liberado boolean not null default false,

    -- Dados do pagamento
    mp_payment_id text,

    -- Dados complementares
    temas text,
    duracao text,
    autoriza_contato text default 'Não',
    lgpd_aceito text default 'Não',
    comprovante_anexado text
);

-- Índices para consulta rápida
create index if not exists idx_inscricoes_email on public.inscricoes (lower(email));
create index if not exists idx_inscricoes_oab_cpf on public.inscricoes (lower(oab_cpf));
create index if not exists idx_inscricoes_status on public.inscricoes (status);
create index if not exists idx_inscricoes_codigo on public.inscricoes (codigo_acesso);

-- ============================================================
-- SEGURANÇA (RLS)
-- - Anônimos (site público): só podem INSERIR novas inscrições
-- - Autenticados (painel admin): podem VER e ATUALIZAR tudo
-- ============================================================
alter table public.inscricoes enable row level security;

create policy "anon_pode_inserir"
    on public.inscricoes
    for insert
    to anon
    with check (true);

create policy "admin_pode_ver"
    on public.inscricoes
    for select
    to authenticated
    using (true);

create policy "admin_pode_atualizar"
    on public.inscricoes
    for update
    to authenticated
    using (true);

create policy "admin_pode_excluir"
    on public.inscricoes
    for delete
    to authenticated
    using (true);

-- ============================================================
-- IMPORTANTE — Se o banco JÁ foi criado antes (versão antiga do
-- schema), rode apenas este bloco para adicionar as colunas novas:
--
-- alter table public.inscricoes
--     add column if not exists codigo_acesso text unique,
--     add column if not exists checkin_at timestamptz;
--
-- create index if not exists idx_inscricoes_codigo
--     on public.inscricoes (codigo_acesso);
-- ============================================================

-- ============================================================
-- USUÁRIO ADMIN (login do painel)
-- Recomendado: Dashboard → Authentication → Users → Add user
-- (crie um usuário com o e-mail da coordenação)
-- ============================================================

-- ============================================================
-- VARIÁVEIS DE AMBIENTE (Edge Functions)
-- Supabase → Edge Functions → Manage secrets:
--
-- MP_ACCESS_TOKEN = Access Token de PRODUÇÃO do Mercado Pago
--                  (ou token de TESTE da sandbox enquanto testa)
-- ============================================================
