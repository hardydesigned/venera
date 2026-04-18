create table users (
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

create table refresh_token (
    id bigserial primary key,
    user_id uuid not null unique references users(id) on delete cascade,
    token varchar(255) not null unique,
    expiry_date timestamptz not null
);

create table forgot_password_token (
    id bigserial primary key,
    user_id uuid not null unique references users(id) on delete cascade,
    token varchar(255) not null unique,
    expiry_date timestamptz not null
);

create table one_time_tokens (
    id bigserial primary key,
    token_value varchar(255) not null unique,
    username varchar(320) not null,
    created_at timestamp not null,
    expires_at timestamp not null,
    used boolean not null default false
);

create table teams (
    id uuid primary key,
    owner_user_id uuid not null references users(id) on delete cascade,
    name varchar(200) not null,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table team_members (
    id uuid primary key,
    team_id uuid not null references teams(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role varchar(20) not null check (role in ('OWNER', 'MEMBER')),
    joined_at timestamptz not null default now(),
    unique (team_id, user_id)
);

create table team_invitations (
    id uuid primary key,
    team_id uuid not null references teams(id) on delete cascade,
    email varchar(320) not null,
    invited_by_user_id uuid not null references users(id) on delete cascade,
    status varchar(20) not null check (status in ('PENDING', 'ACCEPTED', 'DECLINED')),
    created_at timestamptz not null default now(),
    responded_at timestamptz
);

create table tasks (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    team_id uuid references teams(id) on delete cascade,
    title varchar(200) not null,
    description text,
    start_date timestamp,
    due_date timestamp,
    category varchar(1) not null check (category in ('A', 'B', 'C')),
    status varchar(20) not null check (status in ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
    estimated_duration_minutes integer,
    actual_duration_minutes integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_tasks_estimated_duration_non_negative
        check (estimated_duration_minutes is null or estimated_duration_minutes >= 0),
    constraint chk_tasks_actual_duration_non_negative
        check (actual_duration_minutes is null or actual_duration_minutes >= 0)
);

create table subtasks (
    id uuid primary key,
    task_id uuid not null references tasks(id) on delete cascade,
    title varchar(200) not null,
    done boolean not null default false,
    start_date timestamp,
    due_date timestamp,
    category varchar(1) not null check (category in ('A', 'B', 'C')),
    status varchar(20) not null check (status in ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table calendar_events (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
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

create table project_workspaces (
    id uuid primary key,
    user_id uuid references users(id) on delete cascade,
    team_id uuid references teams(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint project_workspaces_scope_check check ((user_id is null) <> (team_id is null))
);

create table workspace_folders (
    id varchar(100) primary key,
    workspace_id uuid not null references project_workspaces(id) on delete cascade,
    name varchar(500) not null,
    sort_order int not null default 0
);

create table workspace_projects (
    id varchar(100) primary key,
    workspace_id uuid not null references project_workspaces(id) on delete cascade,
    name varchar(500) not null,
    description text not null default '',
    color varchar(50) not null default '#2563eb',
    folder_id varchar(100),
    sort_order int not null default 0
);

create table workspace_project_lists (
    id varchar(100) primary key,
    project_id varchar(100) not null references workspace_projects(id) on delete cascade,
    name varchar(500) not null,
    sort_order int not null default 0
);

create table workspace_project_cards (
    task_id uuid primary key references tasks(id) on delete cascade,
    list_id varchar(100) not null references workspace_project_lists(id) on delete cascade,
    sort_order int not null default 0,
    parent_task_id uuid references tasks(id) on delete set null
);

create table finance_mappings (
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

create table finance_transactions (
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
    constraint finance_transactions_scope_check check ((user_id is null) <> (team_id is null)),
    constraint finance_transactions_single_category_check
        check (category_main is null or category_main = 'Standard')
);

create index idx_one_time_tokens_username on one_time_tokens(username);
create index idx_tasks_user_id on tasks(user_id);
create index idx_tasks_team_id on tasks(team_id);
create index idx_tasks_due_date on tasks(due_date);
create index idx_calendar_events_user_id on calendar_events(user_id);
create index idx_calendar_events_start_at on calendar_events(start_at);
create index idx_team_members_user_id on team_members(user_id);
create index idx_team_members_team_id on team_members(team_id);
create index idx_team_invitations_email on team_invitations(lower(email));
create index idx_team_invitations_team_id on team_invitations(team_id);

create unique index idx_project_workspaces_user_unique
    on project_workspaces(user_id)
    where team_id is null;

create unique index idx_project_workspaces_team_unique
    on project_workspaces(team_id)
    where team_id is not null;

create index idx_workspace_projects_workspace_id on workspace_projects(workspace_id);
create index idx_workspace_folders_workspace_id on workspace_folders(workspace_id);
create index idx_workspace_project_lists_project_id on workspace_project_lists(project_id);
create index idx_workspace_project_cards_list_id on workspace_project_cards(list_id);

create unique index idx_finance_mappings_user_provider_unique
    on finance_mappings(user_id, provider_key)
    where team_id is null;

create unique index idx_finance_mappings_team_provider_unique
    on finance_mappings(team_id, provider_key)
    where team_id is not null;

create index idx_finance_transactions_user_booking_date
    on finance_transactions(user_id, booking_date)
    where team_id is null;

create index idx_finance_transactions_team_booking_date
    on finance_transactions(team_id, booking_date)
    where team_id is not null;

create unique index idx_finance_transactions_user_dedupe_hash
    on finance_transactions(user_id, dedupe_hash)
    where team_id is null;

create unique index idx_finance_transactions_team_dedupe_hash
    on finance_transactions(team_id, dedupe_hash)
    where team_id is not null;
