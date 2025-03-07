from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Tag
from .serializers import TagSerializer

class TagTreeView(APIView):
    #retrieves the tag tree
    def get(self, request):
        root_tags = Tag.objects.filter(parent_tag__isnull=True)
        tags = TagSerializer(root_tags, many=True).data
        return Response(tags)

    #Creates a new tag, asociates it with parent tag and returns the new tag
    def post(self, request):
        data = request.data
        parent_tag = Tag.objects.get(id=data['parent_tag']) if data.get('parent_tag') else None
        new_tag = Tag.objects.create(name=data['name'], description=data['description'], parent_tag=parent_tag)
        return Response(TagSerializer(new_tag).data)

    #Moves tag to a new parent
    def put(self, request, tag_id):
        tag = Tag.objects.get(id=tag_id)
        new_parent_tag = Tag.objects.get(id=request.data['new_parent_id'])
        tag.parent_tag = new_parent_tag
        tag.save()
        return Response(TagSerializer(tag).data)

    # Deletes a tag
    def delete(self, request, tag_id):
        tag = Tag.objects.get(id=tag_id)
        tag.delete()
        return Response(status=204)