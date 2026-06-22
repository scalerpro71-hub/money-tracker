export const AIML_CURRICULUM = [
  {
    id: "math-foundations",
    category: "Foundations",
    title: "Math for ML",
    topics: [
      { id: "linear-algebra", name: "Linear Algebra", subtopics: ["Vectors & Matrices", "Eigenvalues", "SVD", "PCA"] },
      { id: "calculus", name: "Calculus & Optimization", subtopics: ["Derivatives", "Gradient Descent", "Chain Rule", "Convexity"] },
      { id: "probability", name: "Probability & Statistics", subtopics: ["Distributions", "Bayes Theorem", "MLE", "Hypothesis Testing"] },
      { id: "information-theory", name: "Information Theory", subtopics: ["Entropy", "KL Divergence", "Cross-Entropy", "Mutual Information"] },
    ],
  },
  {
    id: "classical-ml",
    category: "Classical ML",
    title: "Classical Machine Learning",
    topics: [
      { id: "supervised", name: "Supervised Learning", subtopics: ["Linear Regression", "Logistic Regression", "SVM", "Decision Trees", "Random Forest", "Gradient Boosting"] },
      { id: "unsupervised", name: "Unsupervised Learning", subtopics: ["K-Means", "DBSCAN", "Hierarchical Clustering", "Gaussian Mixture Models"] },
      { id: "dimensionality", name: "Dimensionality Reduction", subtopics: ["PCA", "t-SNE", "UMAP", "Autoencoders"] },
      { id: "model-eval", name: "Model Evaluation", subtopics: ["Cross-Validation", "Bias-Variance", "ROC/AUC", "Confusion Matrix", "F1 Score"] },
    ],
  },
  {
    id: "deep-learning",
    category: "Deep Learning",
    title: "Deep Learning",
    topics: [
      { id: "nn-basics", name: "Neural Network Basics", subtopics: ["Perceptron", "Backpropagation", "Activation Functions", "Regularization"] },
      { id: "cnn", name: "Convolutional Neural Networks", subtopics: ["Convolution", "Pooling", "ResNet", "EfficientNet", "Object Detection"] },
      { id: "rnn", name: "Recurrent Neural Networks", subtopics: ["LSTM", "GRU", "Seq2Seq", "Attention Mechanism"] },
      { id: "transformers", name: "Transformers", subtopics: ["Self-Attention", "BERT", "GPT", "Vision Transformer", "T5"] },
      { id: "training", name: "Training Techniques", subtopics: ["Batch Norm", "Dropout", "Learning Rate Scheduling", "Mixed Precision", "Gradient Clipping"] },
    ],
  },
  {
    id: "nlp",
    category: "NLP",
    title: "Natural Language Processing",
    topics: [
      { id: "text-processing", name: "Text Processing", subtopics: ["Tokenization", "Stemming/Lemmatization", "TF-IDF", "Word Embeddings"] },
      { id: "llms", name: "Large Language Models", subtopics: ["Pretraining", "Fine-tuning", "RLHF", "Prompt Engineering", "RAG"] },
      { id: "nlp-tasks", name: "NLP Tasks", subtopics: ["Sentiment Analysis", "NER", "Text Classification", "Summarization", "Machine Translation"] },
    ],
  },
  {
    id: "computer-vision",
    category: "Computer Vision",
    title: "Computer Vision",
    topics: [
      { id: "image-basics", name: "Image Processing", subtopics: ["Filters", "Edge Detection", "Feature Extraction", "Image Augmentation"] },
      { id: "cv-tasks", name: "CV Tasks", subtopics: ["Image Classification", "Object Detection", "Segmentation", "Pose Estimation", "GANs"] },
      { id: "diffusion", name: "Generative Models", subtopics: ["VAE", "GAN", "Diffusion Models", "Stable Diffusion", "ControlNet"] },
    ],
  },
  {
    id: "mlops",
    category: "MLOps",
    title: "ML Engineering & MLOps",
    topics: [
      { id: "frameworks", name: "Frameworks & Tools", subtopics: ["PyTorch", "TensorFlow", "Hugging Face", "scikit-learn", "JAX"] },
      { id: "data-engineering", name: "Data Engineering", subtopics: ["Data Pipelines", "Feature Engineering", "Feature Stores", "Data Versioning"] },
      { id: "deployment", name: "Model Deployment", subtopics: ["ONNX", "TorchServe", "FastAPI", "Docker", "Kubernetes"] },
      { id: "monitoring", name: "Monitoring & Drift", subtopics: ["Model Monitoring", "Data Drift", "A/B Testing", "Shadow Deployment"] },
      { id: "experiment-tracking", name: "Experiment Tracking", subtopics: ["MLflow", "W&B", "DVC", "Optuna", "Ray Tune"] },
    ],
  },
  {
    id: "rl",
    category: "Advanced",
    title: "Reinforcement Learning",
    topics: [
      { id: "rl-basics", name: "RL Fundamentals", subtopics: ["MDP", "Q-Learning", "Policy Gradient", "Actor-Critic"] },
      { id: "deep-rl", name: "Deep RL", subtopics: ["DQN", "PPO", "SAC", "DDPG", "Multi-Agent RL"] },
    ],
  },
];

export const RESOURCES = [
  { id: "r1", type: "Course", title: "fast.ai Practical Deep Learning", url: "https://fast.ai", tags: ["deep-learning", "practical"], free: true },
  { id: "r2", type: "Course", title: "CS229 Machine Learning - Stanford", url: "https://cs229.stanford.edu", tags: ["classical-ml", "math-foundations"], free: true },
  { id: "r3", type: "Course", title: "Deep Learning Specialization - Coursera", url: "https://coursera.org/specializations/deep-learning", tags: ["deep-learning"], free: false },
  { id: "r4", type: "Book", title: "Hands-On ML with Scikit-Learn, Keras & TF", url: "https://oreilly.com", tags: ["classical-ml", "deep-learning"], free: false },
  { id: "r5", type: "Book", title: "Deep Learning (Goodfellow et al.)", url: "https://deeplearningbook.org", tags: ["deep-learning", "math-foundations"], free: true },
  { id: "r6", type: "Course", title: "CS224N NLP with Deep Learning - Stanford", url: "https://web.stanford.edu/class/cs224n", tags: ["nlp"], free: true },
  { id: "r7", type: "Course", title: "Full Stack Deep Learning", url: "https://fullstackdeeplearning.com", tags: ["mlops"], free: true },
  { id: "r8", type: "Paper", title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", tags: ["transformers", "nlp"], free: true },
  { id: "r9", type: "Course", title: "Hugging Face NLP Course", url: "https://huggingface.co/learn/nlp-course", tags: ["nlp", "llms"], free: true },
  { id: "r10", type: "Course", title: "RL Course by David Silver - DeepMind", url: "https://deepmind.com/learning-resources/reinforcement-learning", tags: ["rl"], free: true },
];

export const STATUS_OPTIONS = ["not-started", "in-progress", "completed", "review-needed"];

export const SKILL_LEVELS = {
  "not-started": { label: "Not Started", color: "#6b7280", bg: "#f3f4f6" },
  "in-progress": { label: "In Progress", color: "#d97706", bg: "#fef3c7" },
  "completed": { label: "Completed", color: "#059669", bg: "#d1fae5" },
  "review-needed": { label: "Review Needed", color: "#7c3aed", bg: "#ede9fe" },
};
