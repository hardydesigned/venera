create table if not exists finance_mappings (
    id uuid primary key,
    user_id uuid references users(id) on delete cascade,
    team_id uuid references teams(id) on delete cascade,
    provider_key varchar(100) not null,
    date_column varchar(200) not null,
    payee_column varchar(200) not null,
    purpose_column varchar(200) not null,
    amount_column varchar(200) not null,
    delimiter varchar(5) not null,
    date_format varchar(100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint finance_mappings_scope_check check ((user_id is null) <> (team_id is null))
);

create unique index if not exists idx_finance_mappings_user_provider_unique
    on finance_mappings(user_id, provider_key)
    where team_id is null;

create unique index if not exists idx_finance_mappings_team_provider_unique
    on finance_mappings(team_id, provider_key)
    where team_id is not null;

create table if not exists finance_transactions (
    id uuid primary key,
    user_id uuid references users(id) on delete cascade,
    team_id uuid references teams(id) on delete cascade,
    booking_date date not null,
    payee text not null,
    purpose text,
    amount numeric(14, 2) not null,
    category_main varchar(120),
    category_sub varchar(120),
    confidence double precision,
    source_provider_key varchar(100),
    dedupe_hash varchar(200) not null,
    manual_override boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint finance_transactions_scope_check check ((user_id is null) <> (team_id is null))
);

create index if not exists idx_finance_transactions_user_booking_date
    on finance_transactions(user_id, booking_date)
    where team_id is null;

create index if not exists idx_finance_transactions_team_booking_date
    on finance_transactions(team_id, booking_date)
    where team_id is not null;

create unique index if not exists idx_finance_transactions_user_dedupe_hash
    on finance_transactions(user_id, dedupe_hash)
    where team_id is null;

create unique index if not exists idx_finance_transactions_team_dedupe_hash
    on finance_transactions(team_id, dedupe_hash)
    where team_id is not null;
