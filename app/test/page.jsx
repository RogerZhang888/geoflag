import React from "react";

import createClient from "@/lib/supabase/server";

export default async function TestPage() {

  const sb = await createClient();

  const { data } = await sb.from("documents").select();

  return <pre>{JSON.stringify(data, null, 4)}</pre>;
}
 