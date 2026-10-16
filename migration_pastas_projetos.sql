CREATE TABLE IF NOT EXISTS public.pastas_projetos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id integer NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    nome text NOT NULL CHECK (length(trim(nome)) > 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS pastas_projetos_workspace_nome_uidx
    ON public.pastas_projetos (workspace_id, lower(nome));

ALTER TABLE public.projetos
    ADD COLUMN IF NOT EXISTS pasta_id uuid;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'projetos_pasta_id_fkey'
          AND conrelid = 'public.projetos'::regclass
    ) THEN
        ALTER TABLE public.projetos
            ADD CONSTRAINT projetos_pasta_id_fkey
            FOREIGN KEY (pasta_id)
            REFERENCES public.pastas_projetos(id)
            ON DELETE SET NULL;
    END IF;
END;
$$;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE public.pastas_projetos
    TO anon, authenticated;

DROP POLICY IF EXISTS pastas_projetos_select_public ON public.pastas_projetos;
CREATE POLICY pastas_projetos_select_public
    ON public.pastas_projetos
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS pastas_projetos_insert_public ON public.pastas_projetos;
CREATE POLICY pastas_projetos_insert_public
    ON public.pastas_projetos
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
