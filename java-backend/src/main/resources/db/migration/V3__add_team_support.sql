create table if not exists teams (
    id uuid primary key,
    owner_user_id uuid not null references users(id) on delete cascade,
    name varchar(200) not null,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists team_members (
    id uuid primary key,
    team_id uuid not null references teams(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role varchar(20) not null check (role in ('OWNER', 'MEMBER')),
    joined_at timestamptz not null default now(),
    unique (team_id, user_id)
);

create table if not exists team_invitations (
    id uuid primary key,
    team_id uuid not null references teams(id) on delete cascade,
    email varchar(320) not null,
    invited_by_user_id uuid not null references users(id) on delete cascade,
    status varchar(20) not null check (status in ('PENDING', 'ACCEPTED', 'DECLINED')),
    created_at timestamptz not null default now(),
    responded_at timestamptz
);

alter table tasks
    add column if not exists team_id uuid references teams(id) on delete cascade;

create index if not exists idx_team_members_user_id on team_members(user_id);
create index if not exists idx_team_members_team_id on team_members(team_id);
create index if not exists idx_team_invitations_email on team_invitations(lower(email));
create index if not exists idx_team_invitations_team_id on team_invitations(team_id);
create index if not exists idx_tasks_team_id on tasks(team_id);
