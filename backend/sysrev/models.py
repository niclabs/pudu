from django.db import models

class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    parent_tag = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='child_tags'
    )

    def __str__(self):
        return self.name

    def get_tree(self):
        'Recursively builds the tree structure.'
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'children': [child.get_tree() for child in self.child_tags.all()]
        }
