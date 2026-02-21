create table if not exists users (
    id uuid primary key,
    email varchar(320) not null unique,
    first_name varchar(200) not null,
    last_name varchar(200) not null,
    active boolean not null default true,
    password_hash varchar(255) not null,
    onboarding_completed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists refresh_token (
    id bigserial primary key,
    user_id uuid not null unique references users(id) on delete cascade,
    token varchar(255) not null unique,
    expiry_date timestamptz not null
);

create table if not exists forgot_password_token (
    id bigserial primary key,
    user_id uuid not null unique references users(id) on delete cascade,
    token varchar(255) not null unique,
    expiry_date timestamptz not null
);

create table if not exists one_time_tokens (
    id bigserial primary key,
    token_value varchar(255) not null unique,
    username varchar(320) not null,
    created_at timestamp not null,
    expires_at timestamp not null,
    used boolean not null default false
);

create table if not exists projects (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    title varchar(200) not null,
    description text,
    goal text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists tasks (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    project_id uuid references projects(id) on delete set null,
    title varchar(200) not null,
    description text,
    start_date date,
    due_date date,
    category varchar(1) not null check (category in ('A', 'B', 'C')),
    status varchar(20) not null check (status in ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists subtasks (
    id uuid primary key,
    task_id uuid not null references tasks(id) on delete cascade,
    title varchar(200) not null,
    done boolean not null default false,
    start_date date,
    due_date date,
    category varchar(1) not null check (category in ('A', 'B', 'C')),
    status varchar(20) not null check (status in ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists calendar_events (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    project_id uuid references projects(id) on delete set null,
    task_id uuid references tasks(id) on delete set null,
    title varchar(200) not null,
    start_at timestamptz not null,
    end_at timestamptz not null,
    category varchar(1) not null check (category in ('A', 'B', 'C')),
    color varchar(20) not null default 'sky',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint calendar_events_time_check check (end_at > start_at)
);

create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_tasks_user_id on tasks(user_id);
create index if not exists idx_tasks_due_date on tasks(due_date);
create index if not exists idx_calendar_events_user_id on calendar_events(user_id);
create index if not exists idx_calendar_events_start_at on calendar_events(start_at);
create index if not exists idx_one_time_tokens_username on one_time_tokens(username);
