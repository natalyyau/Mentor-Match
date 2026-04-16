from django.db import migrations, models


def migrate_application_statuses(apps, schema_editor):
    Applications = apps.get_model("users", "Applications")
    status_map = {
        "pending": "New",
        "under_review": "Under Review",
        "accepted": "Accepted",
        "rejected": "Rejected",
    }
    for old_status, new_status in status_map.items():
        Applications.objects.filter(status=old_status).update(status=new_status)


def reverse_migrate_application_statuses(apps, schema_editor):
    Applications = apps.get_model("users", "Applications")
    status_map = {
        "New": "pending",
        "Under Review": "under_review",
        "Accepted": "accepted",
        "Rejected": "rejected",
    }
    for old_status, new_status in status_map.items():
        Applications.objects.filter(status=old_status).update(status=new_status)


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0003_applications_email_applications_statementofinterest_and_more"),
    ]

    operations = [
        migrations.RunPython(migrate_application_statuses, reverse_migrate_application_statuses),
        migrations.AlterField(
            model_name="applications",
            name="status",
            field=models.CharField(
                choices=[
                    ("New", "New"),
                    ("Under Review", "Under Review"),
                    ("Shortlisted", "Shortlisted"),
                    ("Accepted", "Accepted"),
                    ("Rejected", "Rejected"),
                ],
                default="New",
                max_length=50,
            ),
        ),
    ]
