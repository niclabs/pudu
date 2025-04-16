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
        exporting = request.query_params.get('export', False)
        # remove IDs for exporting
        def strip_ids(node):
            node.pop('id', None)
            for child in node.get('children', []):
                strip_ids(child)
            return node

        if tag_id:
            try:
                tag = Tag.objects.get(id=tag_id)
                return Response(tag.get_tree(), status=status.HTTP_200_OK)
            except Tag.DoesNotExist:
                return Response({'error': 'Tag not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        root_tags = Tag.objects.filter(parent_tag__isnull=True)
        tree = [tag.get_tree() for tag in root_tags]
        if exporting:
            tree = [strip_ids(tag_tree) for tag_tree in tree]
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

        # Normalize input to a list
        if isinstance(data, dict):
            data = [data]

        try:
            for tag_tree in data:
                TagTreeView.create_tag_from_tree(tag_tree)
        except KeyError:
            return Response({"error": "Each tag must include at least a 'name' field."},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Tags created successfully."}, status=status.HTTP_201_CREATED)

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
    
    #Aux function for bulk loading trees keeping parent-child relationships
    def create_tag_from_tree(data, parent=None):
        tag = Tag.objects.create(
            name=data['name'],
            description=data.get('description', ''),
            parent_tag=parent
        )

        for child_data in data.get('children', []):
            TagTreeView.create_tag_from_tree(child_data, parent=tag)


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

class ReviewExportView(APIView):
    def get(self, request):
        # Serialize tag tree
        root_tags = Tag.objects.filter(parent_tag__isnull=True)
        def strip_ids(tree):
            tree.pop('id', None)
            for child in tree.get('children', []):
                strip_ids(child)
            return tree
        tag_tree = [strip_ids(tag.get_tree()) for tag in root_tags]

        # Serialize authors
        authors = Author.objects.all().values('name')  # Only include name

        # Serialize studies
        studies = Study.objects.all()
        study_list = []
        for study in studies:
            study_list.append({
                "title": study.title,
                "year": study.year,
                "summary": study.summary,
                "abstract": study.abstract,
                "categorized": study.categorized,
                "tags": [tag.name for tag in study.tags.all()],
                "authors": [author.name for author in study.authors.all()],
                "doi": study.doi,
                "url": study.url,
                "pages": study.pages
            })

        return Response({
            "tag_tree": tag_tree,
            "authors": list(authors.values("name")),
            "studies": study_list
        })
    
from .models import Tag, Author, Study

class ReviewImportView(APIView):
    def post(self, request):
        data = request.data
        tag_tree_data = data.get("tag_tree", [])
        authors_data = data.get("authors", [])
        studies_data = data.get("studies", [])

        # === 1. Import Tag Tree ===
        def create_tag_from_tree(data, parent=None):
            tag, _ = Tag.objects.get_or_create(
                name=data["name"],
                defaults={"description": data.get("description", ""), "parent_tag": parent}
            )
            for child in data.get("children", []):
                create_tag_from_tree(child, parent=tag)

        for tag_data in tag_tree_data:
            create_tag_from_tree(tag_data)

        # === 2. Cache Existing Tags and Authors ===
        tag_map = {tag.name: tag for tag in Tag.objects.all()}
        author_map = {}
        for author in authors_data:
            obj, _ = Author.objects.get_or_create(name=author["name"])
            author_map[author["name"]] = obj

        # === 3. Import Studies ===
        for study_data in studies_data:
            tag_names = study_data.pop("tags", [])
            author_names = study_data.pop("authors", [])

            # Study duplicate prevention
            study, _ = Study.objects.get_or_create(
                doi=study_data["doi"],
                defaults={key: study_data[key] for key in study_data if key != "doi"}
            )

            study.tags.set([tag_map[name] for name in tag_names if name in tag_map])
            study.authors.set([author_map[name] for name in author_names if name in author_map])

        return Response({"message": "Review imported successfully."})
    

    '''
        Example import/export


        {
        "tag_tree": [
            {
                "name": "Machine Learning in Healthcare",
                "description": "Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia Mama mia papa pia ",
                "children": [
                    {
                        "name": "Supervised Learning",
                        "description": "",
                        "children": []
                    },
                    {
                        "name": "Unsupervised Learning",
                        "description": "",
                        "children": []
                    },
                    {
                        "name": "Reinforcement Learning",
                        "description": "",
                        "children": []
                    }
                ]
            },
            {
                "name": "Explainability & Interpretability",
                "description": "",
                "children": []
            },
            {
                "name": "Bias & Fairness",
                "description": "",
                "children": []
            },
            {
                "name": "Study Characteristics",
                "description": "",
                "children": [
                    {
                        "name": "Peer-Reviewed",
                        "description": "",
                        "children": []
                    },
                    {
                        "name": "Preprint",
                        "description": "",
                        "children": []
                    },
                    {
                        "name": "Published in Journal",
                        "description": "",
                        "children": []
                    },
                    {
                        "name": "Published in Conference",
                        "description": "",
                        "children": []
                    }
                ]
            },
            {
                "name": "Evaluation",
                "description": "",
                "children": [
                    {
                        "name": "Real-World Testing",
                        "description": "",
                        "children": []
                    },
                    {
                        "name": "Benchmark Dataset",
                        "description": "",
                        "children": []
                    },
                    {
                        "name": "No Empirical Evaluation",
                        "description": "",
                        "children": []
                    }
                ]
            },
            {
                "name": "Dataset Type",
                "description": "Si te he fallado te pido perdon de la unica forma que se",
                "children": [
                    {
                        "name": "Public Dataset",
                        "description": "",
                        "children": []
                    },
                    {
                        "name": "Private Dataset",
                        "description": "",
                        "children": []
                    },
                    {
                        "name": "Synthetic Data",
                        "description": "",
                        "children": []
                    }
                ]
            }
        ],
        "authors": [
            {
                "name": "Gordon Freeman"
            },
            {
                "name": "Tony Mamamia"
            },
            {
                "name": "Alice Smith"
            },
            {
                "name": "Baby Yoda"
            },
            {
                "name": "Don Cheadle"
            },
            {
                "name": "Morton Devries"
            },
            {
                "name": "Brukan Silverhorn"
            },
            {
                "name": "Bird Johnson"
            },
            {
                "name": "Gabriel Borinc"
            },
            {
                "name": "Johan Cleric"
            },
            {
                "name": "Dr Magnuson"
            },
            {
                "name": "Alyx Vance"
            },
            {
                "name": "Cherished Mathew"
            },
            {
                "name": "Panini Cat"
            },
            {
                "name": "Menjunje Cat"
            }
        ],
        "studies": [
            {
                "title": "Exploring Machine Learning in Healthcare",
                "year": 2023,
                "summary": "This study explores the application of machine learning in healthcare, focusing on supervised learning.",
                "abstract": "The paper delves into the role of supervised learning in healthcare, particularly in disease prediction and diagnosis.",
                "categorized": true,
                "tags": [
                    "Machine Learning in Healthcare",
                    "Supervised Learning"
                ],
                "authors": [
                    "Gordon Freeman",
                    "Alice Smith"
                ],
                "doi": "10.1234/ai.healthcare.2023",
                "url": "http://example.com/study1",
                "pages": "1-10"
            },
            {
                "title": "Unsupervised Learning Techniques in Medical Imaging",
                "year": 2022,
                "summary": "Unsupervised learning methods for image classification in medical diagnostics.",
                "abstract": "This study highlights how unsupervised learning algorithms can be utilized for improving medical imaging diagnostics.",
                "categorized": true,
                "tags": [
                    "Machine Learning in Healthcare",
                    "Unsupervised Learning"
                ],
                "authors": [
                    "Baby Yoda",
                    "Don Cheadle"
                ],
                "doi": "10.1234/ai.medical.2022",
                "url": "http://example.com/study2",
                "pages": "11-20"
            },
            {
                "title": "Reinforcement Learning for Optimizing Healthcare Decisions",
                "year": 2023,
                "summary": "The potential of reinforcement learning to improve decision-making processes in healthcare systems.",
                "abstract": "This paper investigates the integration of reinforcement learning techniques in healthcare decision support systems.",
                "categorized": true,
                "tags": [
                    "Machine Learning in Healthcare",
                    "Reinforcement Learning"
                ],
                "authors": [
                    "Morton Devries",
                    "Bird Johnson"
                ],
                "doi": "10.1234/rl.healthcare.2023",
                "url": "http://example.com/study3",
                "pages": "21-30"
            },
            {
                "title": "Explainability in Healthcare Machine Learning Models",
                "year": 2024,
                "summary": "A deep dive into the importance of explainability and interpretability in healthcare AI models.",
                "abstract": "The study examines methods for enhancing the transparency of AI-based systems used in healthcare.",
                "categorized": true,
                "tags": [
                    "Explainability & Interpretability"
                ],
                "authors": [
                    "Gabriel Borinc",
                    "Johan Cleric"
                ],
                "doi": "10.1234/explainability.ai.2024",
                "url": "http://example.com/study4",
                "pages": "31-40"
            },
            {
                "title": "Bias & Fairness in Healthcare AI Algorithms",
                "year": 2024,
                "summary": "Investigating the presence of biases in healthcare AI systems and their impact on patient outcomes.",
                "abstract": "This paper explores the issues of fairness and bias in machine learning algorithms used in healthcare.",
                "categorized": true,
                "tags": [
                    "Bias & Fairness"
                ],
                "authors": [
                    "Dr Magnuson",
                    "Alyx Vance"
                ],
                "doi": "10.1234/bias.fairness.2024",
                "url": "http://example.com/study5",
                "pages": "41-50"
            }
        ]
    }
    '''
