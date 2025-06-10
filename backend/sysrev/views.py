from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import Tag, Study, Author, Review
from .serializers import TagSerializer, StudySerializer, AuthorSerializer, ReviewSerializer
from django.db.models import Count
from collections import Counter


class SysRevView(APIView):
    '''API view for managing systematic reviews.
    This view handles CRUD operations for reviews, including creating, retrieving, updating, and deleting reviews.
    '''
    def get(self, request, review_id=None):
        '''Retrieve a specific review by ID or all reviews if no ID is provided.'''
        if review_id:
            try:
                review = Review.objects.get(id=review_id)
                serializer = ReviewSerializer(review)
                return Response(serializer.data)
            except Review.DoesNotExist:
                return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            reviews = Review.objects.all()
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        
    def post(self, request):
        '''Create a new review.'''
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, review_id=None):
        '''Delete a specific review by ID.'''
        if not review_id:
            return Response({'error': 'Review ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = Review.objects.get(id=review_id)
            review.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def patch(self, request, review_id=None):
        '''Update a specific review by ID.'''
        print("patching: ", request.data)
        if not review_id:
            return Response({'error': 'Review ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#CRUD operations on the tag tree
class TagTreeView(APIView):
    '''
    API view for managing the tag tree.
    '''
    '''
        GET retrieves the tag tree or a specific tag by ID.
    '''
    def get(self, request, tag_id=None):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        if tag_id:
            try:
                tag = Tag.objects.get(id=tag_id, review_id=review_id)
                return Response(tag.get_tree())
            except Tag.DoesNotExist:
                return Response({'error': 'Tag not found or not part of this review'}, status=404)
        else:
            root_tags = Tag.objects.filter(parent_tag__isnull=True, review_id=review_id)
            tree = [tag.get_tree() for tag in root_tags]
            return Response(tree)
        
        
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
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        data = request.data
        if isinstance(data, list):
            for d in data:
                d['review'] = review_id
        else:
            data['review'] = review_id

        serializer = TagSerializer(data=data, many=isinstance(data, list))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

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
        print('PUT request received for updating tag parent')
        print(request.data)
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        tag_id = request.data.get('id')
        if not tag_id:
            return Response({'error': 'Tag ID is required.'}, status=400)

        try:
            tag = Tag.objects.get(id=tag_id, review_id=review_id)
        except Tag.DoesNotExist:
            return Response({'error': 'Tag not found in this review.'}, status=404)

        new_parent_id = request.data.get('parent_tag')
        if new_parent_id == 0:
            tag.parent_tag = None
        elif new_parent_id:
            try:
                new_parent_tag = Tag.objects.get(id=new_parent_id, review_id=review_id)
                tag.parent_tag = new_parent_tag
            except Tag.DoesNotExist:
                return Response({'error': 'New parent tag not found in this review.'}, status=404)

        serializer = TagSerializer(tag, data={'id': tag.id}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)




    def delete(self, request, tag_id=None):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        if not tag_id:
            return Response({'error': 'Tag ID is required in the URL.'}, status=400)

        try:
            tag = Tag.objects.get(id=tag_id, review_id=review_id)
            tag.delete()
            return Response({'message': 'Tag deleted successfully'}, status=204)
        except Tag.DoesNotExist:
            return Response({'error': 'Tag not found in this review.'}, status=404)

    '''
    PATCH edits a tag's details.
    
    # new name for the tag
    
    Example PUT request body:
    {                  
    "Name": "Obama"          
    }
    '''
   
    def patch(self, request, tag_id=None):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        if not tag_id:
            return Response({'error': 'Tag ID is required in the URL.'}, status=400)

        try:
            tag = Tag.objects.get(id=tag_id, review_id=review_id)
        except Tag.DoesNotExist:
            return Response({'error': 'Tag not found in this review.'}, status=404)

        updated = False
        if 'name' in request.data:
            tag.name = request.data['name']
            updated = True
        if 'description' in request.data:
            tag.description = request.data['description']
            updated = True

        if not updated:
            return Response({'error': 'No name or description provided to update.'}, status=400)

        tag.save()
        return Response({'message': 'Tag updated successfully'}, status=200)

class StudiesView(APIView):
    '''
    API view for managing studies.
    '''
    def get(self, request, study_id=None):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        if study_id:
            try:
                study = Study.objects.get(id=study_id, review_id=review_id)
                serializer = StudySerializer(study)
                return Response(serializer.data)
            except Study.DoesNotExist:
                return Response({'error': 'Study not found'}, status=404)
        else:
            studies = Study.objects.filter(review_id=review_id)
            serializer = StudySerializer(studies, many=True)
            return Response(serializer.data)

    def delete(self, request, study_id=None):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        if not study_id:
            return Response({'error': 'Study ID is required.'}, status=400)

        try:
            study = Study.objects.get(id=study_id, review_id=review_id)
            study.delete()
            return Response({'message': 'Study deleted successfully'}, status=204)
        except Study.DoesNotExist:
            return Response({'error': 'Study not found or does not belong to this review'}, status=404)
    
    def post(self, request):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        data = request.data
        if isinstance(data, list):
            for d in data:
                d['review'] = review_id
        else:
            data['review'] = review_id

        serializer = StudySerializer(data=data, many=isinstance(data, list))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def patch(self, request, study_id=None):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        if not study_id:
            return Response({'error': 'Study ID is required.'}, status=400)

        try:
            study = Study.objects.get(id=study_id, review_id=review_id)
        except Study.DoesNotExist:
            return Response({'error': 'Study not found or does not belong to this review'}, status=404)

        serializer = StudySerializer(study, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class AuthorsView(APIView):
    '''
    API view for managing authors.
    '''
    def get(self, request, author_id=None):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        if author_id:
            try:
                author = Author.objects.get(id=author_id, review_id=review_id)
                serializer = AuthorSerializer(author)
                return Response(serializer.data)
            except Author.DoesNotExist:
                return Response({'error': 'Author not found'}, status=404)
        else:
            authors = Author.objects.filter(review_id=review_id)
            serializer = AuthorSerializer(authors, many=True)
            return Response(serializer.data)
        

    def post(self, request):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        data = request.data
        if isinstance(data, list):
            for d in data:
                d['review'] = review_id
        else:
            data['review'] = review_id

        serializer = AuthorSerializer(data=data, many=isinstance(data, list))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def delete(self, request):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        authors = request.data.get('authors')
        if not isinstance(authors, list) or not authors:
            return Response({'error': 'A non-empty list of authors must be provided.'}, status=400)

        authors_qs = Author.objects.filter(id__in=authors, review_id=review_id)
        found_ids = list(authors_qs.values_list('id', flat=True))
        authors_qs.delete()

        return Response({'deleted': found_ids}, status=200)

@api_view(['GET'])
def tag_study_counts(request):
    review_id = request.query_params.get('review_id')
    if not review_id:
        return Response({'error': 'review_id is required'}, status=400)

    tags_with_counts = Tag.objects.filter(review_id=review_id).annotate(
        study_count=Count('studies')
    ).values('id', 'name', 'study_count')

    return Response(tags_with_counts)

@api_view(['GET'])
def flag_study_counts(request):
    review_id = request.query_params.get('review_id')
    if not review_id:
        return Response({'error': 'review_id is required'}, status=400)

    counter = Counter()
    studies = Study.objects.filter(review_id=review_id)
    for study in studies:
        for flag in study.flags:
            counter[flag] += 1

    return Response(counter)


class ReviewExportView(APIView):
    def get(self, request):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        # Serialize tag tree
        root_tags = Tag.objects.filter(parent_tag__isnull=True, review_id=review_id)
        def strip_ids(tree):
            tree.pop('id', None)
            for child in tree.get('children', []):
                strip_ids(child)
            return tree
        tag_tree = [strip_ids(tag.get_tree()) for tag in root_tags]

        # Serialize authors
        authors = Author.objects.filter(review_id=review_id).values('name')

        # Serialize studies
        studies = Study.objects.filter(review_id=review_id)
        study_list = []
        for study in studies:
            study_list.append({
                "title": study.title,
                "year": study.year,
                "summary": study.summary,
                "abstract": study.abstract,
                "flags": study.flags,
                "tags": [tag.name for tag in study.tags.all()],
                "authors": [author.name for author in study.authors.all()],
                "doi": study.doi,
                "url": study.url,
                "pages": study.pages
            })

        return Response({
            "tag_tree": tag_tree,
            "authors": list(authors),
            "studies": study_list
        })

class ReviewImportView(APIView):
    def post(self, request):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        data = request.data
        tag_tree_data = data.get("tag_tree", [])
        authors_data = data.get("authors", [])
        studies_data = data.get("studies", [])

        # Importing tag tree
        def create_tag_from_tree(data, parent=None):
            name = data["name"].strip()
            description = (data.get("description") or "").strip()

            tag, _ = Tag.objects.get_or_create(
                name=name,
                parent_tag=parent,
                review_id=review_id,
                defaults={"description": description}
            )

            for child in data.get("children", []):
                create_tag_from_tree(child, parent=tag)

        for tag_data in tag_tree_data:
            create_tag_from_tree(tag_data)

        # Build a tag lookup (by name + parent) for fast access
        tag_map = {(tag.name, tag.parent_tag_id): tag for tag in Tag.objects.filter(review_id=review_id)}

        # Importing authors
        author_map = {}
        for author in authors_data:
            name = author["name"].strip()
            obj, _ = Author.objects.get_or_create(name=name, review_id=review_id)
            author_map[name] = obj

        # Importing Studies
        for study_data in studies_data:
            tag_names = study_data.pop("tags", [])
            author_names = study_data.pop("authors", [])

            title = study_data.get("title", "").strip()
            year = study_data.get("year")

            # remaining fields go into defaults
            study_defaults = {
                key: study_data[key]
                for key in study_data
                if key not in ["tags", "authors"]
            }
            study_defaults["review_id"] = review_id

            # Creates or updates the study
            study, _ = Study.objects.get_or_create(
                title=title,
                year=year,
                review_id=review_id,
                defaults=study_defaults
            )

            # Assigns study tags
            tag_instances = []
            for tag_name in tag_names:
                tag_name = tag_name.strip()
                matching_tags = [t for (name, _), t in tag_map.items() if name == tag_name]
                if matching_tags:
                    tag_instances.append(matching_tags[0])
            study.tags.set(tag_instances)

            # Assigns study authors
            study.authors.set([
                author_map[name.strip()]
                for name in author_names
                if name.strip() in author_map
            ])

        return Response({"message": "Review imported successfully."})