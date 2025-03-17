from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Tag
from .serializers import TagSerializer


#CRUD operations on the tag tree
class TagTreeView(APIView):

    '''
        GET retrieves the tag tree or a specific tag by ID.
    '''
    def get(self, request, tag_id=None):
        if tag_id:
            try:
                tag = Tag.objects.get(id=tag_id)
                return Response(tag.get_tree(), status=status.HTTP_200_OK)
            except Tag.DoesNotExist:
                return Response({'error': 'Tag not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            root_tags = Tag.objects.filter(parent_tag__isnull=True)
            tree = [tag.get_tree() for tag in root_tags]
            return Response(tree, status=status.HTTP_200_OK)
        
        

    '''
    POST creates a new tag.

    Example POST request body:
    {
    "name": "New Tag",
    "description": "This is a new tag",
    "parent_tag": 1
    }
    '''

    def post(self, request):
        data = request.data

        # Check if the request contains multiple tags (list of dicts)
        if isinstance(data, list):
            serializer = TagSerializer(data=data, many=True)
        else:
            serializer = TagSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    '''
    PUT moves a tag to a new parent tag.
    
    # ID of the tag to update
    # ID of the new parent tag
    
    Example PUT request body:
    {
    "id": 5,                    
    "parent_tag": 3            
    }
    '''

    def put(self, request):
        tag_id = request.data.get('id')

        if not tag_id:
            return Response({'error': 'Tag ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tag = Tag.objects.get(id=tag_id)
        except Tag.DoesNotExist:
            return Response({'error': 'Tag not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_parent_id = request.data.get('parent_tag')

        if new_parent_id == 0:
            tag.parent_tag = None  # Tag becomes a root node
            request.data['parent_tag'] = None
        else:
            try:
                new_parent_tag = Tag.objects.get(id=new_parent_id)
                tag.parent_tag = new_parent_tag
            except Tag.DoesNotExist:
                return Response({'error': 'New parent tag not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TagSerializer(tag, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




    def delete(self, request, tag_id=None):
        if not tag_id:
            return Response({'error': 'Tag ID is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tag = Tag.objects.get(id=tag_id)
            tag.delete()
            return Response({'message': 'Tag deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Tag.DoesNotExist:
            return Response({'error': 'Tag not found.'}, status=status.HTTP_404_NOT_FOUND)
        

    '''
    PATCH edits a tag's details.
    
    # new name for the tag
    
    Example PUT request body:
    {                  
    "Name": "Obama"          
    }
    '''
   
    def patch(self, request, tag_id=None):
        if not tag_id:
            return Response({'error': 'Tag ID is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tag = Tag.objects.get(id=tag_id)
        except Tag.DoesNotExist:
            return Response({'error': 'Tag not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_name = request.data.get('name')
        if not new_name:
            return Response({'error': 'New name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        tag.name = new_name
        tag.save()

        return Response({'message': 'Tag renamed successfully'}, status=status.HTTP_200_OK)
    
    #TODO que patch pueda cambiar una descripción
