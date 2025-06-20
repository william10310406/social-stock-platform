from app import create_app, db
from flask_migrate import Migrate

app = create_app()
migrate = Migrate(app, db)


# This allows us to use `flask db` commands
# The app context is available to the commands
@app.shell_context_processor
def make_shell_context():
    return dict(db=db)
