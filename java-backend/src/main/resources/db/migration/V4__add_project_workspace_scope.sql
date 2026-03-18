create table if not exists project_workspaces (
    id uuid primary key,
    user_id uuid references users(id) on delete cascade,
    team_id uuid references teams(id) on delete cascade,
    payload text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint project_workspaces_scope_check check ((user_id is null) <> (team_id is null))
);

create unique index if not exists idx_project_workspaces_user_unique
    on project_workspaces(user_id)
    where team_id is null;

create unique index if not exists idx_project_workspaces_team_unique
    on project_workspaces(team_id)
    where team_id is not null;
