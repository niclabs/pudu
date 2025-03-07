from rest_framework import serializers
from .models import Tag

class TagSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'description', 'parent_tag', 'children']

#recursively obtains children for each tag
    def get_children(self, obj):
        children = Tag.objects.filter(parent_tag=obj)
        return TagSerializer(children, many=True).data