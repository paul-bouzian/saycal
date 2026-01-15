import * as neonPlugin from '@neondatabase/vite-plugin-postgres'

const postgresPlugin = neonPlugin.default || neonPlugin.postgresPlugin || (neonPlugin as any)

export default typeof postgresPlugin === 'function' ? postgresPlugin({
  seed: {
    type: 'sql-script',
    path: 'db/init.sql',
  },
  referrer: 'create-tanstack',
  dotEnvKey: 'VITE_DATABASE_URL',
}) : null
