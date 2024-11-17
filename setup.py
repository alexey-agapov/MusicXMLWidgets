from setuptools import setup, find_packages

setup(
    name="MusicXMLWidgets",
    version="0.1.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=["anywidget"],
    description="A package containing MusicXML widgets for Jupyter",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Alexey Agapov",
    url="https://github.com/cubicapple/MusicXMLWidgets",  
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
