# Electria Database Setup

Group 15  
Completed by Will Davis  

## Development environment

I created a shared PostgreSQL database using Supabase's Free plan.

- Organization: Electria App Group 15
- Project: Electria
- Region: Americas

## Database verification

I ran the following query in the Supabase SQL Editor:

```sql
SELECT
    current_database() AS database_name,
    version() AS database_version,
    'Electria database is running' AS status;
```

The query returned one row showing the database name, PostgreSQL
version, and status message. This verified that the database was
running and could execute SQL queries.

## Team access

Each teammate should create their own Supabase account.
The project owner (myself) can invite teammates through the organization's
team settings. After accepting an invitation, teammates can open
Electria and use the SQL Editor.

## Next steps

The initial database work will focus on Users, Vehicle Types,
and Vehicles from our ERD.

The remaining tasks are preparing the table definitions, creating
fictional sample data, and making retrieval queries. These files
can be prepared independently and tested together afterward.
