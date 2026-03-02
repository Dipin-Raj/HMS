# This file can be used to encapsulate alembic commands for easier execution.
# For example, you could define functions here to:
# - run 'alembic revision --autogenerate -m "Initial migration"'
# - run 'alembic upgrade head'
# - run 'alembic downgrade -1'
# This helps in scripting migration operations without directly calling alembic from CLI.

# Example:
# import os
# from alembic.config import Config
# from alembic import command
#
# def run_alembic_command(command_name, *args):
#     alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "../backend/alembic.ini"))
#     getattr(command, command_name)(alembic_cfg, *args)
#
# if __name__ == "__main__":
#     # To create a new migration:
#     # run_alembic_command("revision", "--autogenerate", "-m", "Initial migration")
#
#     # To apply all migrations:
#     # run_alembic_command("upgrade", "head")
