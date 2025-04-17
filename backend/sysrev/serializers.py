from rest_framework import serializers
from .models import Tag, Study, Author

class TagSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'description', 'parent_tag', 'children']

#recursively obtains children for each tag
    def get_children(self, obj):
        if obj.child_tags.exists():
            return TagSerializer(obj.child_tags.all(), many=True).data
        return []
    
    
class StudySerializer(serializers.ModelSerializer):
    #write only fields for tags and authors using id arrays
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, write_only=True)
    authors = serializers.PrimaryKeyRelatedField(queryset=Author.objects.all(), many=True, write_only=True)

    #read only fields for tags and authors using string representations 
    tags_display = TagSerializer(source='tags', many=True, read_only=True)
    authors_display = serializers.StringRelatedField(source='authors', many=True, read_only=True)

    class Meta:
        model = Study
        fields = ['id', 'title', 'year', 'summary', 'abstract', 'flags', 'tags', 'tags_display', 'authors', 'authors_display', 'doi', 'url', 'pages', 'pathto_pdf']

    VALID_FLAGS = {"Reviewed", "Pending Review", "Missing Data", "Flagged"}

    def validate_flags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Flags must be a list.")
        invalid = [flag for flag in value if flag not in self.VALID_FLAGS]
        if invalid:
            raise serializers.ValidationError(f"Invalid flag(s): {', '.join(invalid)}")
        return value

class AuthorSerializer(serializers.ModelSerializer):
    studies = StudySerializer(many=True, read_only=True)

    class Meta:
        model = Author
        fields = ['id', 'name', 'studies']