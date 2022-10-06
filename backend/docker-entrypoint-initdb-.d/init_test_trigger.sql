CREATE OR REPLACE FUNCTION notify_new_user()
    RETURNS trigger AS
$BODY$
BEGIN
    PERFORM pg_notify('new_user', row_to_json(NEW)::text);
    RETURN NULL;
END;
$BODY$
    LANGUAGE plpgsql VOLATILE
                     COST 100;

CREATE TRIGGER notify_new_user
    AFTER INSERT
    ON "User"
    FOR EACH ROW
EXECUTE PROCEDURE notify_new_user();