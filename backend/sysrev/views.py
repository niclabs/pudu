from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import Tag, Study, Author
from .serializers import TagSerializer, StudySerializer, AuthorSerializer
from django.db.models import Count
from collections import Counter


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
    "flags": ["Pending Review"]
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
        
    def patch(self, request, study_id=None):
        if not study_id:
            return Response({'error': 'Study ID is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            study = Study.objects.get(id=study_id)
        except Study.DoesNotExist:
            return Response({'error': 'Study not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudySerializer(study, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

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

    def delete(self, request, author_id=None):
        if not author_id:
            return Response({'error': 'Author ID is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            author = Author.objects.get(id=author_id)
            author.delete()
            return Response({'message': 'Author deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Author.DoesNotExist:
            return Response({'error': 'Author not found.'}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['GET'])
def tag_study_counts(request):
    tags_with_counts = Tag.objects.annotate(
        study_count=Count('studies')
    ).values('id', 'name', 'study_count')
    return Response(tags_with_counts)

@api_view(['GET'])
def flag_study_counts(request):
    counter = Counter()
    for study in Study.objects.all():
        for flag in study.flags:
            counter[flag] += 1

    return Response(counter)


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
                "flags": study.flags,
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

        # Importing tag tree
        def create_tag_from_tree(data, parent=None):
            name = data["name"].strip()
            description = data.get("description", "").strip()

            tag, _ = Tag.objects.get_or_create(
                name=name,
                parent_tag=parent,
                defaults={"description": description}
            )

            for child in data.get("children", []):
                create_tag_from_tree(child, parent=tag)

        for tag_data in tag_tree_data:
            create_tag_from_tree(tag_data)

        # Build a tag lookup (by name + parent) for fast access
        tag_map = {(tag.name, tag.parent_tag_id): tag for tag in Tag.objects.all()}

        # Importing authors
        author_map = {}
        for author in authors_data:
            name = author["name"].strip()
            obj, _ = Author.objects.get_or_create(name=name)
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
            # Creates or updates the study
            study, _ = Study.objects.get_or_create(
                title=title,
                year=year,
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
        "flags": ["Reviewed"],
        "tags": [
            "Machine Learning in Healthcare",
            "Supervised Learning"
        ],
        "authors": [
            "Gordon Freeman",
            "Tony Mamamia"
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
        "flags": ["Pending Review"],
        "tags": [
            "Machine Learning in Healthcare",
            "Unsupervised Learning"
        ],
        "authors": [
            "Alice Smith",
            "Baby Yoda"
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
        "flags": ["Missing Data", "Flagged"],
        "tags": [
            "Machine Learning in Healthcare",
            "Reinforcement Learning"
        ],
        "authors": [
            "Don Cheadle",
            "Morton Devries"
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
        "flags": ["Reviewed"],
        "tags": [
            "Explainability & Interpretability"
        ],
        "authors": [
            "Brukan Silverhorn",
            "Bird Johnson"
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
        "flags": ["Reviewed"],
        "tags": [
            "Bias & Fairness"
        ],
        "authors": [
            "Gabriel Borinc",
            "Johan Cleric"
        ],
        "doi": "10.1234/bias.fairness.2024",
        "url": "http://example.com/study5",
        "pages": "41-50"
    },
    {
        "title": "Papers in Healthcare AI",
        "year": 2021,
        "summary": "An analysis of peer-reviewed studies in healthcare AI and their impact on the field.",
        "abstract": "This paper reviews the most influential peer-reviewed studies in healthcare AI, with a focus on diagnostic applications.",
        "flags": ["Pending Review"],
        "tags": [
            "Study Characteristics",
            "Peer-Reviewed"
        ],
        "authors": [
            "Dr Magnuson",
            "Alyx Vance"
        ],
        "doi": "10.1234/peerreviewed.healthcare.2021",
        "url": "http://example.com/study6",
        "pages": "51-60"
    },
    {
        "title": "Preprint Papers on Healthcare AI",
        "year": 2022,
        "summary": "This paper analyzes the growing role of preprint papers in healthcare AI research.",
        "abstract": "Focusing on the significance of preprints, this paper discusses their importance in rapid healthcare AI advancements.",
        "flags": ["Missing Data"],
        "tags": [
            "Study Characteristics",
            "Preprint"
        ],
        "authors": [
            "Cherished Mathew",
            "Panini Cat"
        ],
        "doi": "10.1234/preprint.healthcare.2022",
        "url": "http://example.com/study7",
        "pages": "61-70"
    },
    {
        "title": "Journal Publications on Healthcare AI",
        "year": 2023,
        "summary": "The role of journal publications in shaping the future of AI in healthcare.",
        "abstract": "This study examines journal publications in the field of healthcare AI and their influence on medical research and practice.",
        "flags": ["Reviewed"],
        "tags": [
            "Study Characteristics",
            "Published in Journal"
        ],
        "authors": [
            "Gordon Freeman",
            "Menjunje Cat"
        ],
        "doi": "10.1234/journal.healthcare.2023",
        "url": "http://example.com/study8",
        "pages": "71-80"
    },
    {
        "title": "Conference Publications on Healthcare AI",
        "year": 2021,
        "summary": "A review of key conference publications in healthcare AI, focusing on real-world applications.",
        "abstract": "This paper provides an overview of conference papers related to healthcare AI and their practical implementations.",
        "flags": ["Pending Review"],
        "tags": [
            "Study Characteristics",
            "Published in Conference"
        ],
        "authors": [
            "Tony Mamamia",
            "Baby Yoda"
        ],
        "doi": "10.1234/conference.healthcare.2021",
        "url": "http://example.com/study9",
        "pages": "81-90"
    },
    {
        "title": "Real-World Testing of Healthcare AI Models",
        "year": 2024,
        "summary": "Exploring the role of real-world testing in healthcare AI and its impact on model performance.",
        "abstract": "The paper discusses the importance of testing AI models in real-world healthcare environments.",
        "flags": ["Reviewed", "Flagged"],
        "tags": [
            "Evaluation",
            "Real-World Testing"
        ],
        "authors": [
            "Don Cheadle",
            "Morton Devries"
        ],
        "doi": "10.1234/realworld.healthcare.2024",
        "url": "http://example.com/study10",
        "pages": "91-100"
    },
    {
        "title": "Advanced Techniques in Healthcare AI",
        "year": 2024,
        "summary": "This study explores various advanced machine learning techniques for healthcare applications, covering supervised, unsupervised, and reinforcement learning, as well as considerations of fairness and bias.",
        "abstract": "The paper investigates the impact of advanced AI techniques such as supervised, unsupervised, and reinforcement learning in healthcare. It also addresses the challenges of fairness and bias in AI-driven healthcare solutions.",
        "flags": ["Reviewed"],
        "tags": [
            "Machine Learning in Healthcare",
            "Supervised Learning",
            "Unsupervised Learning",
            "Bias & Fairness",
            "Real-World Testing"
        ],
        "authors": [
            "Gordon Freeman",
            "Tony Mamamia",
            "Alice Smith",
            "Baby Yoda",
            "Don Cheadle"
        ],
        "doi": "10.1234/advanced.ai.healthcare.2024",
        "url": "http://example.com/advanced-healthcare-ai",
        "pages": "1-20"
    }
]
}
    '''