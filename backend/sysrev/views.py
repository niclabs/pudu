"""
Django-REST Views.

This file contains all the logic for the API endpoints (URLs) consumed by the Frontend (React).
It also handles HTTP requests (GET, POST, PUT, PATCH, DELETE).

For more information on this file, see
https://www.django-rest-framework.org/api-guide/views/
"""

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.decorators import api_view
from .models import Tag, Study, Author, Review
from .serializers import SimpleStudySerializer, TagSerializer, StudySerializer, AuthorSerializer, ReviewSerializer, RegisterSerializer
from django.db.models import Count
from django.db import transaction
from collections import Counter
import csv
import bibtexparser
from django.http import HttpResponse


# Used on registration page for creating new users
class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

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
            reviews = Review.objects.filter(owner=request.user)
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        
    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print("Review creation errors:", serializer.errors) 
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
            serializer = SimpleStudySerializer(studies, many=True)
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

        serializer = AuthorSerializer(data=request.data, many=isinstance(request.data, list))
        if serializer.is_valid():
            serializer.save(review_id=review_id)
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

# Used on the review view when importing the whole review data in JSON format
# Clears all existing review data and replaces with imported data
class ReviewImportView(APIView):
    def post(self, request):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        data = request.data
        try:
            with transaction.atomic():
                # Clear existing data
                Study.objects.filter(review_id=review_id).delete()
                Tag.objects.filter(review_id=review_id).delete()
                Author.objects.filter(review_id=review_id).delete()
                
                tag_tree_data = data.get("tag_tree", [])
                authors_data = data.get("authors", [])
                studies_data = data.get("studies", [])

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

            tag_map = {(tag.name, tag.parent_tag_id): tag for tag in Tag.objects.filter(review_id=review_id)}

            author_map = {}
            for author in authors_data:
                name = author["name"].strip()
                obj, _ = Author.objects.get_or_create(name=name, review_id=review_id)
                author_map[name] = obj

            for study_data in studies_data:
                tag_names = study_data.pop("tags", [])
                author_names = study_data.pop("authors", [])

                title = study_data.get("title", "").strip()
                year = study_data.get("year")

                study_defaults = {
                    key: study_data[key]
                    for key in study_data
                    if key not in ["tags", "authors"]
                }
                study_defaults["review_id"] = review_id

                study, created = Study.objects.get_or_create(
                title=title,
                year=year,
                review_id=review_id,
                defaults=study_defaults
                )

                if not created:
                    for key, value in study_defaults.items():
                        setattr(study, key, value)
                    study.save()

                tag_instances = []
                for tag_name in tag_names:
                    tag_name = tag_name.strip()
                    matching_tags = [t for (name, _), t in tag_map.items() if name == tag_name]
                    if matching_tags:
                        tag_instances.append(matching_tags[0])
                study.tags.set(tag_instances)

                study.authors.set([
                    author_map[name.strip()]
                    for name in author_names
                    if name.strip() in author_map
                ])

            return Response({"message": "Review imported successfully."})
        
        except Exception as e:
            print(f"Error importando: {e}") 
            return Response({'error': f'Import failed: {str(e)}'}, status=400)


# Used on the review view for exporting the whole review data in JSON format
class ReviewJSONExportView(APIView):
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

# Used on study view for exporting
class ReviewCSVExportView(APIView):
    def get(self, request):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        studies = Study.objects.filter(review_id=review_id)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="review_{review_id}_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Title', 'Year', 'Summary', 'Abstract', 'Flags',
            'Tags', 'Authors', 'DOI', 'URL', 'Pages'
        ])

        for study in studies:
            writer.writerow([
                study.title,
                study.year,
                study.summary,
                study.abstract,
                ", ".join(study.flags),
                ", ".join(tag.name for tag in study.tags.all()),
                ", ".join(author.name for author in study.authors.all()),
                study.doi,
                study.url,
                study.pages
            ])

        return response

class ReviewBibtexExportView(APIView):
    def get(self, request):
        review_id = request.query_params.get('review_id')
        if not review_id:
            return Response({'error': 'review_id is required'}, status=400)

        studies = Study.objects.filter(review_id=review_id)

        response = HttpResponse(content_type='text/bibtex')
        response['Content-Disposition'] = f'attachment; filename="review_{review_id}_export.bib"'

        bibtex_str = ""
        for study in studies:
            bibtex_to_add = f"""@article{{{study.id},
                author = "{', '.join(author.name for author in study.authors.all())}",
                title = "{study.title}",
                journal = "",  
                year = "{study.year}",
                pages = "{study.pages}",
                doi = "{study.doi}",
                howpublished = "{study.url}",
                keywords = "{', '.join(tag.name for tag in study.tags.all())}",
                annote = "{study.abstract}",
                note = "{study.summary}"
            }}
            """
            bibtex_str += bibtex_to_add + "\n"
        ## agrego flags?
        response.write(bibtex_str)

        return response
        
class DashboardStatsView(APIView):
    """
    API view for retrieving statistics and available filter options for the dashboard.
    Get all studies for the review, then apply filters step by step to set up for the graphs stats
    """

    def get(self, request):
        review_id = request.query_params.get('review_id')
        studies = Study.objects.filter(review_id=review_id)

        start_year = request.query_params.get('start_year')
        end_year = request.query_params.get('end_year')

        if start_year:
            studies = studies.filter(year__gte=start_year)
        if end_year:
            studies = studies.filter(year__lte=end_year)

        # available options
        studies_base = studies

        tag_filter = request.query_params.get('tag')
        parent_tag_filter = request.query_params.get('parent_tag')
        author_filter = request.query_params.get('author')

        # Logic for available tags:
        # If an author is selected, only show tags that appear in studies by that author, otherwise show all tags in the review
        if author_filter:
            available_tags = studies_base.filter(authors__name=author_filter).values_list('tags__name', flat=True).distinct().order_by('tags__name')
            available_tags = [t for t in available_tags if t] # Filter out None/empty
        else:
            available_tags = studies_base.values_list('tags__name', flat=True).distinct().order_by('tags__name')
            available_tags = [t for t in available_tags if t]
            if not available_tags and not start_year and not end_year:
                 available_tags = Tag.objects.filter(review_id=review_id).values_list('name', flat=True).distinct().order_by('name')

        # Logic for available authors:
        # If a tag is selected, only show authors that have studies with that tag, otherwise show all authors in the review
        if tag_filter:
            available_authors = studies_base.filter(tags__name=tag_filter).values_list('authors__name', flat=True).distinct().order_by('authors__name')
            available_authors = [a for a in available_authors if a]
        else:
            available_authors = studies_base.values_list('authors__name', flat=True).distinct().order_by('authors__name')
            available_authors = [a for a in available_authors if a]

            if not available_authors and not start_year and not end_year:
                 available_authors = Author.objects.filter(review_id=review_id).values_list('name', flat=True).distinct().order_by('name')

        # Apply stats filters to the main queryset
        if tag_filter:
             studies = studies.filter(tags__name=tag_filter)
        # Get all descendant tags for parent tag 
        if parent_tag_filter:
            try:
                parent_tag_obj = Tag.objects.get(name=parent_tag_filter, review_id=review_id)
                
                def get_descendants(tag):
                    descendants = {tag.id}
                    for child in tag.child_tags.all():
                        descendants.update(get_descendants(child))
                    return descendants
                
                all_descendant_ids = get_descendants(parent_tag_obj)
                studies = studies.filter(tags__id__in=all_descendant_ids)
                
            except Tag.DoesNotExist:
                studies = studies.none()
            
        if author_filter:
            studies = studies.filter(authors__name=author_filter)

        studies = studies.distinct()
        all_studies_data = studies.values_list('id', 'flags')
        
        total_reviewed = 0
        total_pending = 0
        total_flagged = 0
        total_missing_data = 0
        
        for _, flags in all_studies_data:
            is_reviewed = False
            if flags and "Reviewed" in flags:
                total_reviewed += 1
                is_reviewed = True

            if flags:
                if "Flagged" in flags:
                    total_flagged += 1
                if "Missing Data" in flags:
                    total_missing_data += 1

            if not is_reviewed:
                total_pending += 1

        tag_stats = studies.exclude(tags__isnull=True).values(
            'tags__name', 'tags__parent_tag__name', 'year'
        ).annotate(count=Count('id')).order_by('tags__parent_tag__name', 'tags__name', 'year')

        authors_stats = studies.exclude(authors__isnull=True).values(
            'authors__name'
        ).annotate(count=Count('id')).order_by('authors__name')

        root_tags = Tag.objects.filter(review_id=review_id, parent_tag__isnull=True).values_list('name', flat=True).distinct().order_by('name')
        tag_hierarchy = Tag.objects.filter(review_id=review_id).values('name', 'parent_tag__name')

        stats = {
                "total": studies.count(),
                "reviewed": total_reviewed,
                "pending": total_pending,
                "flagged": total_flagged,
                "missing_data": total_missing_data,
                "years": studies.values('year').annotate(count=Count('id')).order_by('year'),
                "tag_stats": list(tag_stats),
                "authors_stats": list(authors_stats),
                "available_tags": list(available_tags),
                "available_authors": list(available_authors),
                "root_tags": list(root_tags),
                "tag_hierarchy": list(tag_hierarchy)
            }
        return Response(stats)