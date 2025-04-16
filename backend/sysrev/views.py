from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import Tag, Study, Author
from .serializers import TagSerializer, StudySerializer, AuthorSerializer
from django.db.models import Count

#CRUD operations on the tag tree
class TagTreeView(APIView):
    '''
    API view for managing the tag tree.
    '''
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
            new_description = request.data.get('description')
            if not new_description:
                return Response({'error': 'Name or description is required.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                tag.description = new_description
                tag.save()
                return Response({'message': 'Tag description updated successfully'}, status=status.HTTP_200_OK)

        tag.name = new_name
        tag.save()

        return Response({'message': 'Tag renamed successfully'}, status=status.HTTP_200_OK)

class StudiesView(APIView):
    '''
    API view for managing studies.
    '''
    def get(self, request, study_id=None):
        if study_id:
            try:
                study = Study.objects.get(id=study_id)
                serializer = StudySerializer(study)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Study.DoesNotExist:
                return Response({'error': 'Study not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            studies = Study.objects.all()
            serializer = StudySerializer(studies, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
    def delete(self, request, study_id=None):
        if not study_id:
            return Response({'error': 'Study ID is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            study = Study.objects.get(id=study_id)
            study.delete()
            return Response({'message': 'Study deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Study.DoesNotExist:
            return Response({'error': 'Study not found.'}, status=status.HTTP_404_NOT_FOUND)
    '''
    Example POST request body:
    {
    "title": "A Study on AI",
    "year": 2023,
    "summary": "This is a summary of the study.",
    "abstract": "This is an abstract of the study.",
    "categorized": true,
    "tags": [1, 2],
    "authors": [1, 2],
    "doi": "10.1234/abcd",
    "url": "http://example.com",
    "pages": "1-10",
    "pathto_pdf": "/path/to/pdf"
    }
    '''
    def post(self, request):
        data = request.data
        if isinstance(data, list):
            serializer = StudySerializer(data=data, many=True)
        else:
            serializer = StudySerializer(data=data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class AuthorsView(APIView):
    '''
    API view for managing authors.
    '''
    def get(self, request, author_id=None):
        if author_id:
            try:
                author = Author.objects.get(id=author_id)
                serializer = AuthorSerializer(author)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Author.DoesNotExist:
                return Response({'error': 'Author not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            authors = Author.objects.all()
            serializer = AuthorSerializer(authors, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
    
    '''
    Example POST request body:
        {
        "name": "Alice Smith"
        }
    '''

    def post(self, request):

        data = request.data
        if isinstance(data, list):
            serializer = AuthorSerializer(data=data, many=True)
        else:
            serializer = AuthorSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
def tag_study_counts(request):
    tags_with_counts = Tag.objects.annotate(
        study_count=Count('studies')
    ).values('id', 'name', 'study_count')
    return Response(tags_with_counts)