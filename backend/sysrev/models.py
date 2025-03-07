from django.db import models

# Create your models here.

#Tag model for the Tag Tree structure
class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    parent_tag = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)


    def __str__(self):
        return self.name