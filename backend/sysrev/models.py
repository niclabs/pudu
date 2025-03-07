from django.db import models

# Create your models here.

#Tag model for the Tag Tree structure
from django.db import models

class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    parent_tag = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='child_tags'  # 🔹 Fix: Define the reverse relation
    )

    def __str__(self):
        return self.name
 #used to access children tags with tag.children.all()

    def __str__(self):
        return self.name
    
    def get_tree(self):
        """
        Recursively builds the tree starting from this tag.
        Returns a dictionary with the tag and its children.
        """
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'children': [child.get_tree() for child in self.child_tags.all()]
        }