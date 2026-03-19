ALTER TABLE project_workspaces DROP COLUMN IF EXISTS payload;

CREATE TABLE IF NOT EXISTS workspace_folders (
    id           varchar(100) PRIMARY KEY,
    workspace_id uuid         NOT NULL REFERENCES project_workspaces (id) ON DELETE CASCADE,
    name         varchar(500) NOT NULL,
    sort_order   int          NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workspace_projects (
    id           varchar(100) PRIMARY KEY,
    workspace_id uuid         NOT NULL REFERENCES project_workspaces (id) ON DELETE CASCADE,
    name         varchar(500) NOT NULL,
    description  text         NOT NULL DEFAULT '',
    color        varchar(50)  NOT NULL DEFAULT '#2563eb',
    folder_id    varchar(100),
    sort_order   int          NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workspace_project_lists (
    id         varchar(100) PRIMARY KEY,
    project_id varchar(100) NOT NULL REFERENCES workspace_projects (id) ON DELETE CASCADE,
    name       varchar(500) NOT NULL,
    sort_order int          NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workspace_project_cards (
    task_id        uuid         PRIMARY KEY REFERENCES tasks (id) ON DELETE CASCADE,
    list_id        varchar(100) NOT NULL REFERENCES workspace_project_lists (id) ON DELETE CASCADE,
    sort_order     int          NOT NULL DEFAULT 0,
    parent_task_id uuid         REFERENCES tasks (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_workspace_projects_workspace_id ON workspace_projects (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_folders_workspace_id ON workspace_folders (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_project_lists_project_id ON workspace_project_lists (project_id);
CREATE INDEX IF NOT EXISTS idx_workspace_project_cards_list_id ON workspace_project_cards (list_id);
