create table "public"."profile" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default (now() AT TIME ZONE 'utc'::text),
    "updated_at" timestamp with time zone default (now() AT TIME ZONE 'utc'::text)
);


alter table "public"."profile" enable row level security;

create table "public"."user_data" (
    "email" text not null,
    "field_1" text,
    "field_2" text,
    "field_3" text,
    "field_4" text,
    "field_5" text,
    "field_6" text,
    "field_7" text,
    "field_8" text,
    "field_9" text,
    "field_10" text,
    "id" uuid not null
);


alter table "public"."user_data" enable row level security;

CREATE UNIQUE INDEX profile_pkey ON public.profile USING btree (id);

CREATE UNIQUE INDEX user_data_id_key ON public.user_data USING btree (id);

CREATE UNIQUE INDEX user_data_pkey ON public.user_data USING btree (id);

CREATE UNIQUE INDEX "user_data_references auth.users_key" ON public.user_data USING btree (email);

alter table "public"."profile" add constraint "profile_pkey" PRIMARY KEY using index "profile_pkey";

alter table "public"."user_data" add constraint "user_data_pkey" PRIMARY KEY using index "user_data_pkey";

alter table "public"."user_data" add constraint "user_data_id_key" UNIQUE using index "user_data_id_key";

alter table "public"."user_data" add constraint "user_data_references auth.users_key" UNIQUE using index "user_data_references auth.users_key";

create policy "Enable read access for authenticated user"
on "public"."profile"
as permissive
for select
to authenticated
using (true);




